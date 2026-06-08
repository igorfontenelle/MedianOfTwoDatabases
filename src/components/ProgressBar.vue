<script setup lang="ts">
defineProps<{
  percent: number
  currentN: number
  visible: boolean
}>()
</script>

<template>
  <div v-if="visible" class="bg-white rounded-2xl shadow p-6">
    <div class="flex justify-between mb-2">
      <span class="text-sm font-medium text-slate-600">Progresso do experimento</span>
      <span class="text-sm font-semibold text-blue-600">{{ percent }}% &mdash; n = {{ currentN.toLocaleString('pt-BR') }}</span>
    </div>
    <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
      <div
        class="h-3 rounded-full bg-blue-500 transition-all duration-300"
        :style="{ width: percent + '%' }"
      />
    </div>
  </div>
</template>
