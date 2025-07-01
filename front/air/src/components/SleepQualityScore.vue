<template>
  <div class="relative w-48 h-48 mx-auto mb-4">
    <svg class="w-full h-full" viewBox="0 0 120 120">
      <circle class="progress-ring-bg" cx="60" cy="60" r="50"></circle>
      <circle 
        class="progress-ring-circle" 
        cx="60" 
        cy="60" 
        r="50" 
        stroke-dasharray="314" 
        :stroke-dashoffset="dashOffset"
      ></circle>
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <p class="text-xs text-gray-500">퀄리티</p>
      <p class="text-5xl font-bold text-blue-500">{{ score }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  score: {
    type: Number,
    required: true,
  }
});

// 점수에 따라 SVG 원의 길이를 계산하는 computed 속성 (Vue의 강력함!)
const dashOffset = computed(() => {
  const circumference = 2 * Math.PI * 50; // 314
  return circumference - (props.score / 100) * circumference;
});
</script>