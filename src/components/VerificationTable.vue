<script setup lang="ts">
import { computed } from 'vue'
import type { SizeResult } from '../experiment/types'

const props = defineProps<{
  results: SizeResult[]
}>()

const totalCases = computed(() => props.results.length * 10)
const failedSizes = computed(() => props.results.filter(r => !r.allCorrect))
const allPassed = computed(() => failedSizes.value.length === 0)

const shownResults = computed(() => {
  if (props.results.length <= 20) return props.results
  const step = Math.floor(props.results.length / 20)
  return props.results.filter((_, i) => i % step === 0 || i === props.results.length - 1)
})
</script>

<template>
  <div v-if="results.length > 0" class="bg-white rounded-2xl shadow p-6">
    <h2 class="text-lg font-semibold text-slate-800 mb-4">Verificação de Corretude</h2>

    <div
      class="mb-4 rounded-lg px-4 py-3 text-sm font-medium"
      :class="allPassed ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'"
    >
      <span v-if="allPassed">
        ✓ Todos os {{ totalCases.toLocaleString('pt-BR') }} casos verificados com sucesso — ambos os algoritmos retornam o mesmo resultado.
      </span>
      <span v-else>
        ✗ Discrepância detectada em {{ failedSizes.length }} tamanho(s): {{ failedSizes.map(r => r.n).join(', ') }}.
      </span>
    </div>

    <p class="text-xs text-slate-400 mb-3">Mostrando amostra representativa de tamanhos:</p>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="text-left py-2 pr-4 text-slate-500 font-medium">n</th>
            <th class="text-right py-2 pr-4 text-slate-500 font-medium">Tempo Naive (ms)</th>
            <th class="text-right py-2 pr-4 text-slate-500 font-medium">Tempo DC (ms)</th>
            <th class="text-right py-2 text-slate-500 font-medium">Corretude</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="r in shownResults"
            :key="r.n"
            class="border-b border-slate-100 hover:bg-slate-50"
          >
            <td class="py-1.5 pr-4 font-mono text-slate-700">{{ r.n.toLocaleString('pt-BR') }}</td>
            <td class="py-1.5 pr-4 text-right font-mono text-red-600">{{ r.avgTimeNaive.toFixed(4) }}</td>
            <td class="py-1.5 pr-4 text-right font-mono text-blue-600">{{ r.avgTimeDC.toFixed(4) }}</td>
            <td class="py-1.5 text-right">
              <span v-if="r.allCorrect" class="text-green-600 font-semibold">✓</span>
              <span v-else class="text-red-600 font-semibold">✗</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
