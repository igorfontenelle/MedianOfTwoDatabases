<script setup lang="ts">
import { ref } from 'vue'
import { generateInputBatch } from '../experiment/inputGenerator'
import type { SizeResult } from '../experiment/types'

const props = defineProps<{
  results: SizeResult[]
  reps: number
}>()

const selectedN = ref<number | null>(
  props.results.length > 0
    ? props.results[Math.floor(props.results.length / 2)].n
    : null
)
const downloading = ref(false)

function downloadJson() {
  if (selectedN.value === null) return
  downloading.value = true

  setTimeout(() => {
    const n = selectedN.value!
    const pairs = generateInputBatch(n, props.reps)
    const data = JSON.stringify({ n, pairs }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `input_n${n}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    downloading.value = false
  }, 10)
}

</script>

<template>
  <div v-if="results.length > 0" class="bg-white rounded-2xl shadow p-6">
    <h2 class="text-lg font-semibold text-slate-800 mb-1">Exportar Entradas para Verificação</h2>
    <p class="text-sm text-slate-500 mb-4">
      Gera e baixa um arquivo <code class="bg-slate-100 px-1 rounded">input_n{X}.json</code> com
      {{ reps }} pares de vetores ordenados para o tamanho selecionado.
    </p>

    <div class="flex flex-wrap items-end gap-4">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tamanho n</label>
        <select
          v-model.number="selectedN"
          class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option v-for="r in results" :key="r.n" :value="r.n">
            {{ r.n.toLocaleString('pt-BR') }}
          </option>
        </select>
      </div>

      <button
        @click="downloadJson"
        :disabled="downloading || selectedN === null"
        class="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {{ downloading ? 'Gerando...' : `Baixar input_n${selectedN ?? '?'}.json` }}
      </button>
    </div>

    <p class="mt-3 text-xs text-slate-400">
      Formato: <code class="bg-slate-100 px-1 rounded">{"n": X, "pairs": [{"a": [...], "b": [...]}, ...]}</code>
    </p>
  </div>
</template>
