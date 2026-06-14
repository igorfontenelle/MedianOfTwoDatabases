<script setup lang="ts">
import { computed, ref } from 'vue'
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
  type TooltipModel,
} from 'chart.js'
import type { SizeResult } from '../experiment/types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const props = defineProps<{
  results: SizeResult[]
}>()

const tooltipRef = ref<HTMLDivElement | null>(null)

const chartData = computed(() => ({
  labels: props.results.map(r => r.n.toLocaleString('pt-BR')),
  datasets: [
    {
      label: 'Juntar + Ordenar — O(n log n)',
      data: props.results.map(r => r.avgTimeNaive),
      borderColor: '#FF3B30',
      backgroundColor: 'rgba(255,59,48,0.07)',
      borderWidth: 2,
      pointRadius: 2,
      tension: 0.3,
    },
    {
      label: 'Divisão e Conquista — O(log n)',
      data: props.results.map(r => r.avgTimeDC),
      borderColor: '#0071E3',
      backgroundColor: 'rgba(0,113,227,0.07)',
      borderWidth: 2,
      pointRadius: 2,
      tension: 0.3,
    },
  ],
}))

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"

const chartOptions = computed(() => {
  const results = props.results

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: { family: FONT, size: 12 },
          color: '#1D1D1F',
          usePointStyle: true,
          pointStyle: 'circle' as const,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: 'Tempo Médio de Execução vs Tamanho da Entrada (n)',
        font: { family: FONT, size: 14, weight: 'bold' as const },
        color: '#1D1D1F',
        padding: { top: 4, bottom: 16 },
      },
      tooltip: {
        enabled: false,
        external: ({ chart, tooltip }: { chart: InstanceType<typeof ChartJS>; tooltip: TooltipModel<'line'> }) => {
          const el = tooltipRef.value
          if (!el) return

          if (tooltip.opacity === 0) {
            el.style.opacity = '0'
            return
          }

          if (!tooltip.dataPoints?.length) return
          const idx = tooltip.dataPoints[0].dataIndex
          const r = results[idx]
          if (!r) return

          const naiveMs = r.avgTimeNaive.toFixed(4)
          const dcMs = r.avgTimeDC.toFixed(4)
          const speedup = r.avgTimeDC > 0
            ? (r.avgTimeNaive / r.avgTimeDC).toLocaleString('pt-BR', { maximumFractionDigits: 0 })
            : '—'
          const medianNaive = r.sampleMedianNaive.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
          const medianDC = r.sampleMedianDC.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
          const n = r.n.toLocaleString('pt-BR')

          const ROW = (color: string, label: string, median: string, ms: string) => `
            <div style="display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:6px;">
              <span style="display:flex;align-items:center;gap:5px;color:${color};font-size:12px;white-space:nowrap;">
                <span style="width:8px;height:8px;border-radius:50%;background:${color};display:inline-block;flex-shrink:0;"></span>${label}
              </span>
              <span style="font-variant-numeric:tabular-nums;font-size:11px;color:#6E6E73;text-align:center;">med. ${median}</span>
              <span style="font-variant-numeric:tabular-nums;font-weight:500;font-size:12px;text-align:right;white-space:nowrap;">${ms} ms</span>
            </div>`

          el.innerHTML = `<div style="
            font-family: ${FONT};
            font-size: 12px;
            color: #1D1D1F;
            background: rgba(255,255,255,0.97);
            border: 1px solid rgba(0,0,0,0.1);
            border-radius: 12px;
            padding: 12px 14px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
            min-width: 230px;
            -webkit-backdrop-filter: saturate(180%) blur(20px);
            backdrop-filter: saturate(180%) blur(20px);
          ">
            <div style="font-weight:600;font-size:13px;margin-bottom:8px;color:#1D1D1F;letter-spacing:-0.01em;">n = ${n}</div>
            <div style="border-top:1px solid rgba(0,0,0,0.07);padding-top:8px;display:flex;flex-direction:column;gap:6px;">
              ${ROW('#FF3B30', 'O(n log n)', medianNaive, naiveMs)}
              ${ROW('#0071E3', 'O(log n)', medianDC, dcMs)}
              <div style="display:flex;justify-content:space-between;align-items:center;padding-top:6px;margin-top:2px;border-top:1px solid rgba(0,0,0,0.06);">
                <span style="color:#6E6E73;">Speedup</span>
                <span style="font-weight:600;color:#34C759;font-size:13px;font-variant-numeric:tabular-nums;">×${speedup}</span>
              </div>
            </div>
          </div>`

          const TOOLTIP_WIDTH = 244
          const OFFSET = 14
          const showRight = tooltip.caretX < chart.canvas.clientWidth - TOOLTIP_WIDTH - OFFSET

          const x = chart.canvas.offsetLeft + tooltip.caretX + (showRight ? OFFSET : -TOOLTIP_WIDTH - OFFSET)
          const y = Math.max(0, chart.canvas.offsetTop + tooltip.caretY - 48)

          el.style.left = x + 'px'
          el.style.top = y + 'px'
          el.style.opacity = '1'
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Tamanho n',
          color: '#6E6E73',
          font: { family: FONT, size: 12 },
        },
        ticks: {
          maxTicksLimit: 10,
          maxRotation: 45,
          color: '#6E6E73',
          font: { family: FONT, size: 11 },
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
        border: { color: 'rgba(0,0,0,0.08)' },
      },
      y: {
        title: {
          display: true,
          text: 'Tempo médio (ms)',
          color: '#6E6E73',
          font: { family: FONT, size: 12 },
        },
        beginAtZero: true,
        ticks: {
          color: '#6E6E73',
          font: { family: FONT, size: 11 },
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
        border: { color: 'rgba(0,0,0,0.08)' },
      },
    },
  }
})
</script>

<template>
  <div
    v-if="results.length > 0"
    class="bg-white rounded-2xl p-6"
    style="border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 1px 4px rgba(0,0,0,0.04);"
  >
    <div class="relative" style="height: 384px;">
      <Line :data="chartData" :options="chartOptions" />
      <div
        ref="tooltipRef"
        class="absolute pointer-events-none"
        style="opacity: 0; transition: opacity 0.12s ease; z-index: 10; top: 0; left: 0;"
      />
    </div>
  </div>
</template>
