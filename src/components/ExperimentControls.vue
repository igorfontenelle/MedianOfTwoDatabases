<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  running: boolean
}>()

const emit = defineEmits<{
  start: [nMin: number, nMax: number, reps: number]
}>()

const nMin = ref(1_000)
const nMax = ref(100_000)
const reps = ref(10)

function handleStart() {
  emit('start', nMin.value, nMax.value, reps.value)
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow p-6">
    <div class="flex flex-wrap gap-6 items-end">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-slate-500 uppercase tracking-wide">n mínimo</label>
        <input
          v-model.number="nMin"
          type="number"
          min="100"
          :max="nMax - 1"
          :disabled="props.running"
          class="w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-slate-500 uppercase tracking-wide">n máximo</label>
        <input
          v-model.number="nMax"
          type="number"
          :min="nMin + 1"
          max="1000000"
          :disabled="props.running"
          class="w-36 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Repetições</label>
        <input
          v-model.number="reps"
          type="number"
          min="1"
          max="50"
          :disabled="props.running"
          class="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
        />
      </div>
      <button
        @click="handleStart"
        :disabled="props.running"
        class="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {{ props.running ? 'Executando...' : 'Executar Experimento' }}
      </button>
    </div>
    <p v-if="nMax > 100_000" class="mt-3 text-xs text-amber-600">
      Atenção: para n &gt; 100.000 o algoritmo ingênuo O(n log n) pode ser muito lento.
    </p>
    <p class="mt-2 text-xs text-slate-400">
      100 tamanhos igualmente espaçados entre n mínimo e n máximo · Faixa recomendada: 100 ≤ n ≤ 1.000.000
    </p>
  </div>
</template>
