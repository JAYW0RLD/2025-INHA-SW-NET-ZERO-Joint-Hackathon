<!-- filepath: c:\project\vue\air\src\components\CostDistributionBar.vue -->
<template>
  <div class="px-4 py-0 rounded-b-3xl shadow-xl">
    <div class="rounded-xl p-6 mb-6">
      <div class="flex justify-between items-center mb-1">
        <span class="text-xs text-gray-600"></span>
        <span class="text-xs text-gray-600">*서비스 미사용 대비</span>
      </div>
      <div class="text-lg font-bold text-blue-500 mb-2">
        오늘은 {{ savingPercent }}% 절약중 이에요
      </div>
      <div class="relative w-full h-12 flex items-center">
        <!-- 내 위치 표시 (예: Good) -->
        <div
          class="absolute -bottom-2"
          :style="{ left: myPercent + '%', transform: 'translateX(-10%)' }"
        >
          <span class="text-xs text-black font-bold">▲</span>
          <span class="text-xs text-black font-bold">23kWh</span>
        </div>
        <canvas ref="barRef" :width="barWidth" height="40" class="w-full"></canvas>
      </div>
      <div class="flex justify-between text-xs text-gray-500 mt-2">
        <span>비용 증가</span>
        <span>비용 유지</span>
        <span class="ml-2">비용 절감</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onBeforeUnmount, inject, computed } from 'vue'
import Chart from 'chart.js/auto'

const barRef = ref(null)
const barWidth = ref(0)
let chartInstance = null

// my_real_Data_saveMoney를 inject
const my_real_Data_saveMoney = inject('my_real_Data_saveMoney')
const appState = inject('appState') // HomeView에서 provide 필요

const savingPercent = ref('1%')

function updateSavingPercent() {
  savingPercent.value = my_real_Data_saveMoney.data / 1000
}

// 최초 1회, 그리고 날짜가 바뀔 때마다 실행
watch(() => appState.selectedDate, updateSavingPercent, { immediate: true })

// 첫 글자(숫자) 추출해서 %로 표시
const myPercent = 70 // 필요시 prop으로 변경

function renderBar() {
  if (!barRef.value) return
  if (chartInstance) chartInstance.destroy()

  // gradient를 canvas에서 직접 생성
  const ctx = barRef.value.getContext('2d')
  const gradient = ctx.createLinearGradient(0, 0, barRef.value.width, 0)
  gradient.addColorStop(0, '#3b82f6')
  gradient.addColorStop(myPercent / 100, '#3b82f6')
  gradient.addColorStop(myPercent / 100, '#9ca3af')
  gradient.addColorStop(1, '#9ca3af')

  chartInstance = new Chart(barRef.value, {
    type: 'bar',
    data: {
      labels: [''],
      datasets: [
        {
          data: [100],
          backgroundColor: gradient,
          borderRadius: 8,
          barPercentage: 1.0,
          categoryPercentage: 1.0,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
      scales: {
        x: {
          display: false,
          stacked: true,
          max: 100,
          min: 0,
        },
        y: {
          display: false,
          stacked: true,
        },
      },
    },
  })
}

function updateBarWidth() {
  nextTick(() => {
    if (barRef.value && barRef.value.parentElement) {
      barWidth.value = barRef.value.parentElement.offsetWidth
      barRef.value.width = barWidth.value
      renderBar()
    }
  })
}

onMounted(() => {
  updateBarWidth()
  window.addEventListener('resize', updateBarWidth)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateBarWidth)
})

watch(
  () => myPercent,
  () => {
    renderBar()
  },
)
</script>
