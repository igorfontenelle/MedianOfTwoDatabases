import { mergeSortMedian } from '../algorithms/mergeSortMedian'
import { divideConquerMedian } from '../algorithms/divideConquerMedian'
import { measureMs, stddev } from '../experiment/timer'
import { generateInputBatch, computeSizeRange, TOTAL_SIZES } from '../experiment/inputGenerator'
import type { InputPair, SizeResult, WorkerMessage, WorkerCommand } from '../experiment/types'

const EPS = 1e-9

function saveInputs(n: number, reps: number, pairs: InputPair[]): void {
  fetch('/api/save-inputs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ n, reps, pairs }),
  }).catch(() => {})
}

async function loadOrGeneratePairs(n: number, reps: number): Promise<InputPair[]> {
  try {
    const res = await fetch(`/data/inputs/input_n${n}_r${reps}.json`)
    if (res.ok) {
      const data = await res.json() as { pairs: InputPair[] }
      return data.pairs
    }
  } catch {}
  const pairs = generateInputBatch(n, reps)
  saveInputs(n, reps, pairs)
  return pairs
}

async function runExperiment(nMin: number, nMax: number, reps: number) {
  const sizes = computeSizeRange(nMin, nMax, TOTAL_SIZES)
  const results: SizeResult[] = []

  for (let i = 0; i < sizes.length; i++) {
    const n = sizes[i]
    const pairs = await loadOrGeneratePairs(n, reps)

    const timesNaive: number[] = []
    const timesDC: number[] = []
    let allCorrect = true
    let sampleMedianNaive = 0
    let sampleMedianDC = 0

    for (let pi = 0; pi < pairs.length; pi++) {
      const { a, b } = pairs[pi]
      const naiveResult = mergeSortMedian(a, b)
      const dcResult = divideConquerMedian(a, b)
      if (Math.abs(naiveResult - dcResult) > EPS) allCorrect = false
      if (pi === 0) { sampleMedianNaive = naiveResult; sampleMedianDC = dcResult }

      const tNaive = measureMs(() => { mergeSortMedian(a, b) })
      const tDC = measureMs(() => { divideConquerMedian(a, b) })

      timesNaive.push(tNaive)
      timesDC.push(tDC)
    }

    const avgNaive = timesNaive.reduce((s, v) => s + v, 0) / timesNaive.length
    const avgDC = timesDC.reduce((s, v) => s + v, 0) / timesDC.length

    results.push({
      n,
      avgTimeNaive: avgNaive,
      avgTimeDC: avgDC,
      stdTimeNaive: stddev(timesNaive, avgNaive),
      stdTimeDC: stddev(timesDC, avgDC),
      allCorrect,
      sampleMedianNaive,
      sampleMedianDC,
    })

    self.postMessage({
      type: 'progress',
      percent: Math.round(((i + 1) / sizes.length) * 100),
      currentN: n,
      sizeIndex: i,
    } satisfies WorkerMessage)
  }

  self.postMessage({ type: 'done', results } satisfies WorkerMessage)
}

self.onmessage = (e: MessageEvent<WorkerCommand>) => {
  const { nMin, nMax, reps } = e.data
  runExperiment(nMin, nMax, reps)
}
