const MIN_DURATION_MS = 10

export function measureMs(fn: () => void): number {
  fn() // warmup: descarta a primeira chamada (JIT compilation)

  let iterations = 0
  const start = performance.now()
  do {
    fn()
    iterations++
  } while (performance.now() - start < MIN_DURATION_MS)

  return (performance.now() - start) / iterations
}

export function stddev(values: number[], mean: number): number {
  if (values.length < 2) return 0
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (values.length - 1)
  return Math.sqrt(variance)
}
