<script setup lang="ts">
import { ref } from 'vue'
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
const errorMsg = ref('')

async function downloadJson() {
  if (selectedN.value === null) return
  downloading.value = true
  errorMsg.value = ''

  const n = selectedN.value
  const filename = `input_n${n}_r${props.reps}.json`
  const url = `/data/inputs/${filename}`

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('not found')
    const blob = await res.blob()
    const anchor = document.createElement('a')
    anchor.href = URL.createObjectURL(blob)
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(anchor.href)
  } catch {
    errorMsg.value = `Arquivo ${filename} não encontrado. Execute o experimento com os parâmetros atuais primeiro.`
  } finally {
    downloading.value = false
  }
}
</script>

<template>
  <div
    v-if="results.length > 0"
    class="bg-white rounded-2xl p-6"
    style="border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 1px 4px rgba(0,0,0,0.04);"
  >
    <h2 class="text-base font-semibold mb-1" style="color: #1D1D1F; letter-spacing: -0.01em;">
      Exportar Entradas
    </h2>
    <p class="text-sm mb-4" style="color: #6E6E73;">
      Baixa o arquivo
      <code style="background: rgba(0,0,0,0.05); padding: 1px 5px; border-radius: 4px; font-size: 11px;">input_n{X}_r{{ reps }}.json</code>
      com os {{ reps }} pares usados no experimento para o tamanho selecionado.
    </p>

    <div class="flex flex-wrap items-end gap-4">
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-medium" style="color: #6E6E73;">Tamanho n</label>
        <select
          v-model.number="selectedN"
          class="text-sm px-3 rounded-lg"
          style="height: 36px; border: 1px solid rgba(0,0,0,0.15); outline: none; color: #1D1D1F; font-family: inherit; background: white;"
        >
          <option v-for="r in results" :key="r.n" :value="r.n">
            {{ r.n.toLocaleString('pt-BR') }}
          </option>
        </select>
      </div>

      <button
        @click="downloadJson"
        :disabled="downloading || selectedN === null"
        class="text-sm font-medium text-white rounded-lg px-5 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        style="height: 36px; background: #34C759; letter-spacing: -0.01em;"
      >
        {{ downloading ? 'Baixando…' : `Baixar input_n${selectedN ?? '?'}_r${reps}.json` }}
      </button>
    </div>

    <p
      v-if="errorMsg"
      class="mt-3 text-xs"
      style="color: #FF3B30;"
    >
      {{ errorMsg }}
    </p>

    <p class="mt-3 text-xs" style="color: #6E6E73;">
      Formato:
      <code style="background: rgba(0,0,0,0.05); padding: 1px 5px; border-radius: 4px; font-size: 11px;">{"n": X, "reps": Y, "pairs": [{"a": [...], "b": [...]}]}</code>
    </p>
  </div>
</template>
