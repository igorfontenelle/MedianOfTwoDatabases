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
  <div class="min-h-screen bg-slate-50">
    <header class="bg-white border-b border-slate-200 shadow-sm">
      <div class="max-w-6xl mx-auto px-6 py-5">
        <h1 class="text-2xl font-bold text-slate-800">Mediana de Dois Bancos de Dados</h1>
        <p class="text-sm text-slate-500 mt-1">
          Comparação experimental: Juntar + Ordenar <span class="font-mono">O(n log n)</span>
          vs Divisão e Conquista <span class="font-mono">O(log n)</span>
        </p>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <ExperimentControls :running="running" @start="startExperiment" />

      <div
        v-if="errorMsg"
        class="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 text-sm text-red-700"
      >
        <strong>Erro:</strong> {{ errorMsg }}
      </div>

      <ProgressBar :visible="running || progress > 0" :percent="progress" :current-n="currentN" />

      <ComparisonChart :results="results" />

      <VerificationTable :results="results" />

      <DiscussionSection :results="results" />

      <ExportPanel :results="results" :reps="lastReps" />
    </main>

    <footer class="border-t border-slate-200 mt-12">
      <div class="max-w-6xl mx-auto px-6 py-4 text-xs text-slate-400">
        Divisão e Conquista — Experimento 6.10 · Análise de Algoritmos
      </div>
    </footer>
  </div>
</template>
