import type { InputPair } from './types'

export const TOTAL_SIZES = 100

export function generateSortedArray(n: number): number[] {
  const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 1_000_000))
  return arr.sort((a, b) => a - b)
}

export function generateInputBatch(n: number, repetitions = 10): InputPair[] {
  return Array.from({ length: repetitions }, () => ({
    a: generateSortedArray(n),
    b: generateSortedArray(n),
  }))
}

export function computeSizeRange(nMin: number, nMax: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) =>
    Math.round(nMin + (i / (count - 1)) * (nMax - nMin))
  )
}
