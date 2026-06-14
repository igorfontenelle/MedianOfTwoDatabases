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
  <div
    v-if="results.length > 0"
    class="bg-white rounded-2xl p-6"
    style="border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 1px 4px rgba(0,0,0,0.04);"
  >
    <h2 class="text-base font-semibold mb-4" style="color: #1D1D1F; letter-spacing: -0.01em;">
      Verificação de Corretude
    </h2>

    <div
      class="mb-4 rounded-xl px-4 py-3 text-sm font-medium"
      :style="allPassed
        ? 'background: rgba(52,199,89,0.08); border: 1px solid rgba(52,199,89,0.25); color: #248A3D;'
        : 'background: rgba(255,59,48,0.06); border: 1px solid rgba(255,59,48,0.2); color: #C0392B;'"
    >
      <span v-if="allPassed">
        ✓ Todos os {{ totalCases.toLocaleString('pt-BR') }} casos verificados — ambos os algoritmos retornam o mesmo resultado.
      </span>
      <span v-else>
        ✗ Discrepância em {{ failedSizes.length }} tamanho(s): {{ failedSizes.map(r => r.n).join(', ') }}.
      </span>
    </div>

    <p class="text-xs mb-3" style="color: #6E6E73;">Amostra representativa de tamanhos testados:</p>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr style="border-bottom: 1px solid rgba(0,0,0,0.08);">
            <th class="text-left py-2 pr-4 font-medium text-xs" style="color: #6E6E73;">n</th>
            <th class="text-right py-2 pr-4 font-medium text-xs" style="color: #FF3B30;">Med. O(n log n)</th>
            <th class="text-right py-2 pr-4 font-medium text-xs" style="color: #0071E3;">Med. O(log n)</th>
            <th class="text-right py-2 pr-4 font-medium text-xs" style="color: #FF3B30;">O(n log n) ms</th>
            <th class="text-right py-2 pr-4 font-medium text-xs" style="color: #0071E3;">O(log n) ms</th>
            <th class="text-right py-2 font-medium text-xs" style="color: #6E6E73;">Corretude</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="r in shownResults"
            :key="r.n"
            style="border-bottom: 1px solid rgba(0,0,0,0.05); transition: background 0.1s;"
            @mouseenter="($event.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.015)'"
            @mouseleave="($event.currentTarget as HTMLElement).style.background = 'transparent'"
          >
            <td class="py-2 pr-4 font-mono text-xs" style="color: #1D1D1F;">{{ r.n.toLocaleString('pt-BR') }}</td>
            <td class="py-2 pr-4 text-right font-mono text-xs" style="color: #FF3B30;">
              {{ r.sampleMedianNaive.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) }}
            </td>
            <td class="py-2 pr-4 text-right font-mono text-xs" style="color: #0071E3;">
              {{ r.sampleMedianDC.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) }}
            </td>
            <td class="py-2 pr-4 text-right font-mono text-xs" style="color: #FF3B30;">{{ r.avgTimeNaive.toFixed(4) }}</td>
            <td class="py-2 pr-4 text-right font-mono text-xs" style="color: #0071E3;">{{ r.avgTimeDC.toFixed(4) }}</td>
            <td class="py-2 text-right text-xs font-semibold">
              <span v-if="r.allCorrect" style="color: #34C759;">✓</span>
              <span v-else style="color: #FF3B30;">✗</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
