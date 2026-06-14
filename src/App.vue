<script setup lang="ts">
import { ref } from 'vue'
import ExperimentControls from './components/ExperimentControls.vue'
import ProgressBar from './components/ProgressBar.vue'
import ComparisonChart from './components/ComparisonChart.vue'
import VerificationTable from './components/VerificationTable.vue'
import DiscussionSection from './components/DiscussionSection.vue'
import ExportPanel from './components/ExportPanel.vue'
import type { SizeResult, WorkerMessage } from './experiment/types'

const running = ref(false)
const progress = ref(0)
const currentN = ref(0)
const results = ref<SizeResult[]>([])
const errorMsg = ref('')
const lastReps = ref(10)

let worker: Worker | null = null

function startExperiment(nMin: number, nMax: number, reps: number) {
  if (running.value) return

  running.value = true
  progress.value = 0
  currentN.value = nMin
  results.value = []
  errorMsg.value = ''
  lastReps.value = reps

  if (worker) worker.terminate()
  worker = new Worker(new URL('./workers/experiment.worker.ts', import.meta.url), { type: 'module' })

  worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
    const msg = e.data
    if (msg.type === 'progress') {
      progress.value = msg.percent
      currentN.value = msg.currentN
    } else if (msg.type === 'done') {
      results.value = msg.results
      running.value = false
      worker?.terminate()
      worker = null
    } else if (msg.type === 'error') {
      errorMsg.value = msg.message
      running.value = false
      worker?.terminate()
      worker = null
    }
  }

  worker.postMessage({ nMin, nMax, reps })
}
</script>

<template>
  <div class="min-h-screen" style="background: #F5F5F7;">
    <header
      class="sticky top-0 z-20 bg-white/90"
      style="border-bottom: 1px solid rgba(0,0,0,0.08); -webkit-backdrop-filter: saturate(180%) blur(20px); backdrop-filter: saturate(180%) blur(20px);"
    >
      <div class="max-w-5xl mx-auto px-6 py-4">
        <h1 class="text-xl font-semibold" style="color: #1D1D1F; letter-spacing: -0.02em;">
          Mediana de Dois Bancos de Dados
        </h1>
        <p class="text-sm mt-0.5" style="color: #6E6E73;">
          Comparação experimental:
          <span class="font-medium" style="color: #FF3B30;">Juntar + Ordenar O(n log n)</span>
          vs
          <span class="font-medium" style="color: #0071E3;">Divisão e Conquista O(log n)</span>
          · Experimento 6.10
        </p>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-6 py-8 space-y-5">
      <ExperimentControls :running="running" @start="startExperiment" />

      <div
        v-if="errorMsg"
        class="rounded-2xl px-6 py-4 text-sm"
        style="background: rgba(255,59,48,0.06); border: 1px solid rgba(255,59,48,0.2); color: #FF3B30;"
      >
        <strong>Erro:</strong> {{ errorMsg }}
      </div>

      <ProgressBar :visible="running || progress > 0" :percent="progress" :current-n="currentN" />

      <ComparisonChart :results="results" />

      <VerificationTable :results="results" />

      <DiscussionSection :results="results" />

      <ExportPanel :results="results" :reps="lastReps" />
    </main>

    <footer style="border-top: 1px solid rgba(0,0,0,0.08); margin-top: 48px;">
      <div class="max-w-5xl mx-auto px-6 py-4 text-xs" style="color: #6E6E73;">
        Divisão e Conquista — Experimento 6.10 · Análise de Algoritmos
      </div>
    </footer>
  </div>
</template>
