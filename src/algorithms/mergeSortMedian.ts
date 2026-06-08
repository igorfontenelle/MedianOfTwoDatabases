export function mergeSortMedian(a: number[], b: number[]): number {
  const merged = [...a, ...b].sort((x, y) => x - y)
  const n = merged.length
  if (n % 2 !== 0) return merged[Math.floor(n / 2)]
  return (merged[n / 2 - 1] + merged[n / 2]) / 2
}
