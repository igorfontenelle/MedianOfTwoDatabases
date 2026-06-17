<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ExperimentControls from './components/ExperimentControls.vue'
import ProgressBar from './components/ProgressBar.vue'
import ComparisonChart from './components/ComparisonChart.vue'
import VerificationTable from './components/VerificationTable.vue'
import DiscussionSection from './components/DiscussionSection.vue'
import ExportPanel from './components/ExportPanel.vue'
import type { SizeResult, WorkerMessage } from './experiment/types'

type Tab = 'live' | 'saved'

const activeTab = ref<Tab>('live')

// Resultados salvos em disco (public/data/results.json)
const savedResults = ref<SizeResult[]>([])
const savedReps = ref(10)

// Resultados da execução ao vivo
const liveResults = ref<SizeResult[]>([])
const liveReps = ref(10)

const running = ref(false)
const progress = ref(0)
const currentN = ref(0)
const errorMsg = ref('')
const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')

let worker: Worker | null = null

onMounted(async () => {
  try {
    const res = await fetch('/data/results.json')
    if (res.ok) {
      const data = await res.json() as { reps: number; results: SizeResult[] }
      savedResults.value = data.results
      savedReps.value = data.reps
      activeTab.value = 'saved'
    }
  } catch {}
})

async function saveResults() {
  saveStatus.value = 'saving'
  try {
    const res = await fetch('/api/save-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reps: liveReps.value, results: liveResults.value }),
    })
    if (res.ok) {
      saveStatus.value = 'saved'
      savedResults.value = liveResults.value
      savedReps.value = liveReps.value
    } else {
      saveStatus.value = 'error'
    }
  } catch {
    saveStatus.value = 'error'
  }
}

function startExperiment(nMin: number, nMax: number, reps: number) {
  if (running.value) return

  running.value = true
  progress.value = 0
  currentN.value = nMin
  liveResults.value = []
  errorMsg.value = ''
  liveReps.value = reps
  saveStatus.value = 'idle'

  if (worker) worker.terminate()
  worker = new Worker(new URL('./workers/experiment.worker.ts', import.meta.url), { type: 'module' })

  worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
    const msg = e.data
    if (msg.type === 'progress') {
      progress.value = msg.percent
      currentN.value = msg.currentN
    } else if (msg.type === 'done') {
      liveResults.value = msg.results
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
      <div class="max-w-5xl mx-auto px-6 pt-4">
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

        <!-- Abas -->
        <div class="flex gap-1 mt-4" style="border-bottom: none;">
          <button
            @click="activeTab = 'live'"
            class="text-sm font-medium px-4 py-2 rounded-t-lg transition-colors"
            :style="activeTab === 'live'
              ? 'background: #F5F5F7; color: #1D1D1F; border: 1px solid rgba(0,0,0,0.08); border-bottom: 1px solid #F5F5F7; margin-bottom: -1px;'
              : 'color: #6E6E73; background: transparent;'"
          >
            Executar Experimento
          </button>
          <button
            v-if="savedResults.length > 0"
            @click="activeTab = 'saved'"
            class="text-sm font-medium px-4 py-2 rounded-t-lg transition-colors flex items-center gap-2"
            :style="activeTab === 'saved'
              ? 'background: #F5F5F7; color: #1D1D1F; border: 1px solid rgba(0,0,0,0.08); border-bottom: 1px solid #F5F5F7; margin-bottom: -1px;'
              : 'color: #6E6E73; background: transparent;'"
          >
            Resultados Salvos
            <span
              class="text-xs font-medium px-1.5 py-0.5 rounded-full"
              style="background: rgba(52,199,89,0.15); color: #1A7F37; font-size: 10px;"
            >
              pré-carregado
            </span>
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-6 py-8 space-y-5">

      <!-- Aba: Executar Experimento -->
      <template v-if="activeTab === 'live'">
        <ExperimentControls :running="running" @start="startExperiment" />

        <div
          v-if="errorMsg"
          class="rounded-2xl px-6 py-4 text-sm"
          style="background: rgba(255,59,48,0.06); border: 1px solid rgba(255,59,48,0.2); color: #FF3B30;"
        >
          <strong>Erro:</strong> {{ errorMsg }}
        </div>

        <ProgressBar :visible="running || progress > 0" :percent="progress" :current-n="currentN" />

        <ComparisonChart :results="liveResults" />
        <VerificationTable :results="liveResults" />
        <DiscussionSection :results="liveResults" />
        <ExportPanel :results="liveResults" :reps="liveReps" />

        <div
          v-if="liveResults.length > 0 && !running"
          class="rounded-2xl px-6 py-4 flex items-center justify-between gap-4"
          style="background: white; border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 1px 4px rgba(0,0,0,0.04);"
        >
          <div>
            <p class="text-sm font-medium" style="color: #1D1D1F;">Salvar resultados para entrega</p>
            <p class="text-xs mt-0.5" style="color: #6E6E73;">
              Gera <code style="background: rgba(0,0,0,0.05); padding: 1px 4px; border-radius: 4px;">public/data/results.json</code>
              — commite o arquivo e o professor verá os resultados ao abrir o app.
            </p>
          </div>
          <button
            @click="saveResults"
            :disabled="saveStatus === 'saving'"
            class="shrink-0 text-sm font-medium text-white rounded-lg px-5 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            style="height: 36px; background: #0071E3; letter-spacing: -0.01em;"
          >
            {{ saveStatus === 'saving' ? 'Salvando…' : saveStatus === 'saved' ? 'Salvo!' : saveStatus === 'error' ? 'Erro ao salvar' : 'Salvar resultados' }}
          </button>
        </div>
      </template>

      <!-- Aba: Resultados Salvos -->
      <template v-if="activeTab === 'saved'">
        <div
          class="rounded-2xl px-6 py-4 flex items-start gap-4"
          style="background: rgba(52,199,89,0.06); border: 1px solid rgba(52,199,89,0.2);"
        >
          <div>
            <p class="text-sm font-semibold" style="color: #1A7F37;">Dados pré-carregados</p>
            <p class="text-xs mt-0.5" style="color: #3A8C4E;">
              Estes resultados foram gerados previamente e carregados de
              <code style="background: rgba(0,0,0,0.06); padding: 1px 4px; border-radius: 4px;">public/data/results.json</code>.
              Para re-executar com dados ao vivo, use a aba <strong>Executar Experimento</strong>.
            </p>
          </div>
        </div>

        <ComparisonChart :results="savedResults" />
        <VerificationTable :results="savedResults" />
        <DiscussionSection :results="savedResults" />
      </template>

    </main>

    <footer style="border-top: 1px solid rgba(0,0,0,0.08); margin-top: 48px;">
      <div class="max-w-5xl mx-auto px-6 py-4 text-xs" style="color: #6E6E73;">
        Divisão e Conquista — Experimento 6.10 · Análise de Algoritmos
      </div>
    </footer>
  </div>
</template>
