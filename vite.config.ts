import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { mkdirSync, writeFileSync, existsSync } from 'fs'
import type { IncomingMessage, ServerResponse } from 'http'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    {
      name: 'save-inputs',
      configureServer(server) {
        server.middlewares.use('/api/save-inputs', (req: IncomingMessage, res: ServerResponse) => {
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.end()
            return
          }
          const chunks: Buffer[] = []
          req.on('data', (chunk: Buffer) => chunks.push(chunk))
          req.on('end', () => {
            try {
              const { n, reps, pairs } = JSON.parse(Buffer.concat(chunks).toString()) as { n: number; reps: number; pairs: unknown }
              const filepath = `public/data/inputs/input_n${n}_r${reps}.json`
              if (!existsSync(filepath)) {
                mkdirSync('public/data/inputs', { recursive: true })
                writeFileSync(filepath, JSON.stringify({ n, pairs }, null, 2))
              }
              res.statusCode = 200
              res.end('ok')
            } catch {
              res.statusCode = 500
              res.end('error')
            }
          })
        })

        server.middlewares.use('/api/save-results', (req: IncomingMessage, res: ServerResponse) => {
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.end()
            return
          }
          const chunks: Buffer[] = []
          req.on('data', (chunk: Buffer) => chunks.push(chunk))
          req.on('end', () => {
            try {
              const body = JSON.parse(Buffer.concat(chunks).toString()) as unknown
              mkdirSync('public/data', { recursive: true })
              writeFileSync('public/data/results.json', JSON.stringify(body))
              res.statusCode = 200
              res.end('ok')
            } catch {
              res.statusCode = 500
              res.end('error')
            }
          })
        })
      },
    },
  ],
  worker: {
    format: 'es',
  },
})
