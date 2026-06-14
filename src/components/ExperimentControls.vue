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
  <div
    class="bg-white rounded-2xl p-6"
    style="border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 1px 4px rgba(0,0,0,0.04);"
  >
    <div class="flex flex-wrap gap-5 items-end">
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-medium" style="color: #6E6E73;">n mínimo</label>
        <input
          v-model.number="nMin"
          type="number"
          min="100"
          :max="nMax - 1"
          :disabled="props.running"
          class="w-28 text-sm px-3 rounded-lg disabled:opacity-40"
          style="height: 36px; border: 1px solid rgba(0,0,0,0.15); outline: none; color: #1D1D1F; font-family: inherit;"
          @focus="($event.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(0,113,227,0.25)'"
          @blur="($event.target as HTMLInputElement).style.boxShadow = 'none'"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-medium" style="color: #6E6E73;">n máximo</label>
        <input
          v-model.number="nMax"
          type="number"
          :min="nMin + 1"
          max="1000000"
          :disabled="props.running"
          class="w-32 text-sm px-3 rounded-lg disabled:opacity-40"
          style="height: 36px; border: 1px solid rgba(0,0,0,0.15); outline: none; color: #1D1D1F; font-family: inherit;"
          @focus="($event.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(0,113,227,0.25)'"
          @blur="($event.target as HTMLInputElement).style.boxShadow = 'none'"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-medium" style="color: #6E6E73;">Repetições</label>
        <input
          v-model.number="reps"
          type="number"
          min="1"
          max="50"
          :disabled="props.running"
          class="w-20 text-sm px-3 rounded-lg disabled:opacity-40"
          style="height: 36px; border: 1px solid rgba(0,0,0,0.15); outline: none; color: #1D1D1F; font-family: inherit;"
          @focus="($event.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(0,113,227,0.25)'"
          @blur="($event.target as HTMLInputElement).style.boxShadow = 'none'"
        />
      </div>

      <button
        @click="handleStart"
        :disabled="props.running"
        class="text-sm font-medium text-white rounded-lg px-5 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        style="height: 36px; background: #0071E3; letter-spacing: -0.01em;"
        @mouseenter="!props.running && (($event.target as HTMLElement).style.background = '#0077ED')"
        @mouseleave="($event.target as HTMLElement).style.background = '#0071E3'"
        @mousedown="($event.target as HTMLElement).style.background = '#006AD6'"
        @mouseup="($event.target as HTMLElement).style.background = '#0077ED'"
      >
        {{ props.running ? 'Executando…' : 'Executar Experimento' }}
      </button>
    </div>

    <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1">
      <p v-if="nMax > 100_000" class="text-xs" style="color: #FF9500;">
        Atenção: para n &gt; 100.000 o algoritmo O(n log n) pode ser lento.
      </p>
      <p class="text-xs" style="color: #6E6E73;">
        100 tamanhos igualmente espaçados entre n mínimo e n máximo
      </p>
    </div>
  </div>
</template>
