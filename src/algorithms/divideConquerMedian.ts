export function divideConquerMedian(a: number[], b: number[]): number {
  if (a.length > b.length) return divideConquerMedian(b, a)

  const m = a.length
  const n = b.length
  let lo = 0
  let hi = m

  while (lo <= hi) {
    const pA = (lo + hi) >> 1
    const pB = ((m + n + 1) >> 1) - pA

    const maxLA = pA === 0 ? -Infinity : a[pA - 1]
    const minRA = pA === m ? Infinity : a[pA]
    const maxLB = pB === 0 ? -Infinity : b[pB - 1]
    const minRB = pB === n ? Infinity : b[pB]

    if (maxLA <= minRB && maxLB <= minRA) {
      const maxLeft = Math.max(maxLA, maxLB)
      if ((m + n) % 2 !== 0) return maxLeft
      return (maxLeft + Math.min(minRA, minRB)) / 2
    } else if (maxLA > minRB) {
      hi = pA - 1
    } else {
      lo = pA + 1
    }
  }

  throw new Error('Arrays inválidos: devem estar ordenados')
}
