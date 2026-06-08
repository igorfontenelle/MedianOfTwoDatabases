<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type TooltipItem,
} from 'chart.js'
import type { SizeResult } from '../experiment/types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const props = defineProps<{
  results: SizeResult[]
}>()

const chartData = computed(() => ({
  labels: props.results.map(r => r.n.toLocaleString('pt-BR')),
  datasets: [
    {
      label: 'Juntar + Ordenar — O(n log n)',
      data: props.results.map(r => r.avgTimeNaive),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239,68,68,0.1)',
      borderWidth: 2,
      pointRadius: 2,
      tension: 0.3,
    },
    {
      label: 'Divisão e Conquista — O(log n)',
      data: props.results.map(r => r.avgTimeDC),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.1)',
      borderWidth: 2,
      pointRadius: 2,
      tension: 0.3,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const },
    title: {
      display: true,
      text: 'Tempo Médio de Execução vs Tamanho da Entrada (n)',
      font: { size: 15 },
    },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<'line'>) =>
          `${ctx.dataset.label ?? ''}: ${(ctx.parsed.y ?? 0).toFixed(4)} ms`,
      },
    },
  },
  scales: {
    x: {
      title: { display: true, text: 'Tamanho n' },
      ticks: {
        maxTicksLimit: 10,
        maxRotation: 45,
      },
    },
    y: {
      title: { display: true, text: 'Tempo médio (ms)' },
      beginAtZero: true,
    },
  },
}))
</script>

<template>
  <div v-if="results.length > 0" class="bg-white rounded-2xl shadow p-6">
    <div class="h-96">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
