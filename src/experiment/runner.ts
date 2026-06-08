import { mergeSortMedian } from '../algorithms/mergeSortMedian'
import { divideConquerMedian } from '../algorithms/divideConquerMedian'
import { measureMs, stddev } from './timer'
import type { InputPair, SizeResult } from './types'

const EPS = 1e-9

export function runForPairs(n: number, pairs: InputPair[]): SizeResult {
  const timesNaive: number[] = []
  const timesDC: number[] = []
  let allCorrect = true

  for (const { a, b } of pairs) {
    let naiveResult = 0
    let dcResult = 0

    const tNaive = measureMs(() => { naiveResult = mergeSortMedian(a, b) })
    const tDC = measureMs(() => { dcResult = divideConquerMedian(a, b) })

    timesNaive.push(tNaive)
    timesDC.push(tDC)

    if (Math.abs(naiveResult - dcResult) > EPS) allCorrect = false
  }

  const avgNaive = timesNaive.reduce((s, v) => s + v, 0) / timesNaive.length
  const avgDC = timesDC.reduce((s, v) => s + v, 0) / timesDC.length

  return {
    n,
    avgTimeNaive: avgNaive,
    avgTimeDC: avgDC,
    stdTimeNaive: stddev(timesNaive, avgNaive),
    stdTimeDC: stddev(timesDC, avgDC),
    allCorrect,
  }
}
