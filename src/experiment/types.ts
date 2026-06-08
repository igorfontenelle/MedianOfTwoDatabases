export interface InputPair {
  a: number[]
  b: number[]
}

export interface SizeResult {
  n: number
  avgTimeNaive: number
  avgTimeDC: number
  stdTimeNaive: number
  stdTimeDC: number
  allCorrect: boolean
}

export interface WorkerCommand {
  nMin: number
  nMax: number
  reps: number
}

export type WorkerMessage =
  | { type: 'progress'; percent: number; currentN: number; sizeIndex: number }
  | { type: 'done'; results: SizeResult[] }
  | { type: 'error'; message: string }
