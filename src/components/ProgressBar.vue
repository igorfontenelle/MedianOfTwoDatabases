<script setup lang="ts">
defineProps<{
  percent: number
  currentN: number
  visible: boolean
}>()
</script>

<template>
  <div
    v-if="visible"
    class="bg-white rounded-2xl p-6"
    style="border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 1px 4px rgba(0,0,0,0.04);"
  >
    <div class="flex justify-between items-center mb-3">
      <span class="text-sm font-medium" style="color: #1D1D1F;">Executando experimento…</span>
      <span class="text-sm font-semibold tabular-nums" style="color: #0071E3;">
        {{ percent }}% · n = {{ currentN.toLocaleString('pt-BR') }}
      </span>
    </div>
    <div
      class="w-full rounded-full overflow-hidden"
      style="height: 6px; background: rgba(0,113,227,0.12);"
    >
      <div
        class="h-full rounded-full transition-all duration-300"
        style="background: #0071E3;"
        :style="{ width: percent + '%' }"
      />
    </div>
  </div>
</template>
