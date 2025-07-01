<template>
  <div class="flex justify-between items-center p-5 bg-gray-50 rounded-lg shadow-xl">
    <div class="flex items-center relative">
      <span class="material-icons mr-2" :class="iconColor">{{ icon }}</span>
      <p class="text-sm text-gray-700">{{ title }}</p>
      <span
        v-if="hasInfo"
        class="material-icons text-gray-400 ml-1 text-base cursor-pointer"
        @mouseenter="showTooltip = true"
        @mouseleave="showTooltip = false"
        >info_outline</span
      >
      <div
        v-if="showTooltip"
        class="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-700 text-white text-xs rounded shadow z-10"
        style="white-space: nowrap"
      >
        {{ infoText }}
      </div>
    </div>
    <p class="text-sm font-semibold" :class="valueColor">{{ value }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showTooltip = ref(false)

defineProps({
  icon: String,
  iconColor: String,
  title: String,
  hasInfo: { type: Boolean, default: false },
  infoText: {
    type: String,
    default: '전력 부하 시간 대에는 금전적/환경적으로 많은 비용이 요구됩니다.',
  },
  value: String,
  valueColor: String,
})
</script>
