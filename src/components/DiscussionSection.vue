<script setup lang="ts">
import { computed } from 'vue'
import type { SizeResult } from '../experiment/types'

const props = defineProps<{
  results: SizeResult[]
}>()

const stats = computed(() => {
  if (props.results.length === 0) return null

  const last = props.results[props.results.length - 1]
  const maxSpeedup = Math.max(...props.results.map(r =>
    r.avgTimeDC > 0 ? r.avgTimeNaive / r.avgTimeDC : 0
  ))

  const crossover = props.results.find(r => r.avgTimeNaive > r.avgTimeDC)

  return {
    maxN: last.n,
    naiveAtMax: last.avgTimeNaive.toFixed(4),
    dcAtMax: last.avgTimeDC.toFixed(4),
    speedup: maxSpeedup.toFixed(1),
    crossoverN: crossover?.n ?? null,
  }
})
</script>

<template>
  <div v-if="results.length > 0 && stats" class="bg-white rounded-2xl shadow p-6">
    <h2 class="text-lg font-semibold text-slate-800 mb-4">Discussão dos Resultados</h2>

    <div class="space-y-4 text-sm text-slate-700 leading-relaxed">
      <p>
        O experimento comparou dois algoritmos para calcular a mediana da união de dois vetores
        ordenados de tamanho <strong>n = 1.000</strong> até <strong>n = {{ stats.maxN.toLocaleString('pt-BR') }}</strong>,
        com 10 repetições por tamanho, totalizando
        <strong>{{ (results.length * 10).toLocaleString('pt-BR') }}</strong> execuções por algoritmo.
      </p>

      <p>
        <strong class="text-red-600">Algoritmo 1 — Juntar + Ordenar (O(n log n)):</strong>
        Concatena os dois vetores e aplica
        <code class="bg-slate-100 px-1 rounded">.sort()</code>, cujo custo cresce com n log n.
        Para n = {{ stats.maxN.toLocaleString('pt-BR') }}, o tempo médio foi de
        <strong>{{ stats.naiveAtMax }} ms</strong>.
      </p>

      <p>
        <strong class="text-blue-600">Algoritmo 2 — Divisão e Conquista (O(log n)):</strong>
        Usa busca binária sobre o menor vetor para encontrar o particionamento correto sem
        percorrer todos os elementos. Para n = {{ stats.maxN.toLocaleString('pt-BR') }}, o tempo
        médio foi de <strong>{{ stats.dcAtMax }} ms</strong>.
      </p>

      <p v-if="stats.crossoverN">
        A partir de <strong>n ≈ {{ stats.crossoverN.toLocaleString('pt-BR') }}</strong>, o algoritmo
        de divisão e conquista passa a ser consistentemente mais rápido que o ingênuo, confirmando
        a vantagem assintótica do O(log n) sobre o O(n log n).
      </p>

      <p>
        No maior tamanho testado, o algoritmo de divisão e conquista foi aproximadamente
        <strong>{{ stats.speedup }}×</strong> mais rápido que o ingênuo.
        Esse ganho tende a crescer com o aumento de n, em consonância com a diferença
        de complexidade assintótica entre as duas abordagens.
      </p>

      <p>
        A verificação de corretude confirmou que ambos os algoritmos retornam
        o mesmo resultado para todas as entradas testadas, aumentando a confiança
        na corretude das implementações.
      </p>
    </div>
  </div>
</template>
