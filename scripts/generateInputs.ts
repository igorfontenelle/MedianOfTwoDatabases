import { writeFileSync, mkdirSync } from 'fs'
import { generateInputBatch, computeSizeRange } from '../src/experiment/inputGenerator'

const N_MIN = 1_000
const N_MAX = 100_000
const TOTAL_SIZES = 100
const REPS = 10
const OUT_DIR = 'public/data/inputs'

mkdirSync(OUT_DIR, { recursive: true })

const sizes = computeSizeRange(N_MIN, N_MAX, TOTAL_SIZES)

console.log(`Gerando ${TOTAL_SIZES} arquivos de entrada (n=${N_MIN} até n=${N_MAX}, ${REPS} pares cada)...`)
console.log(`Destino: ${OUT_DIR}/\n`)

for (let i = 0; i < sizes.length; i++) {
  const n = sizes[i]
  const pairs = generateInputBatch(n, REPS)
  const filename = `${OUT_DIR}/input_n${n}.json`
  writeFileSync(filename, JSON.stringify({ n, pairs }, null, 2))

  const pct = Math.round(((i + 1) / sizes.length) * 100)
  process.stdout.write(`\r[${pct}%] Gerado: input_n${n}.json`)
}

console.log('\n\nConcluído! Arquivos prontos para uso no experimento.')
