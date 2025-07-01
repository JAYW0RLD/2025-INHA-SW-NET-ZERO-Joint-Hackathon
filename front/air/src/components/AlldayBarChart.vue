<template>
  <div class="px-2 pt-6">
    <div class="bg-white p-4 rounded-xl shadow-2xl">
      <div class="flex justify-between items-center mb-2">
        <div class="text-left mx-8">
          <h2 class="text-lg font-semibold text-gray-800">서울의 전력 부하 예측</h2>
          <div class="text-sm text-gray-800">*전기 가격이 비싼 시간에 조금 사용할거에요.</div>
        </div>
        <div class="flex items-center text-sm text-gray-500">
          <span class="material-icons text-yellow-500 mr-1">light</span>
          <span>{{ totalSleep }}</span>
        </div>
      </div>
      <canvas ref="barChartRef" height="120"></canvas>
      <div class="text-sm text-gray-500 mb-4">
        <p class="mt-4">
          사용량 분석 / 금액
          <span class="ml-2 text-black font-medium">
            총 {{ totalUsage }} kWh 사용 / {{ totalCost }}원
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  chartData: Array,
  totalSleep: String,
})

const barChartRef = ref(null)
let chartInstance = null

// chartData를 KST 기준 00~23시 순으로 정렬
const sortedChartData = computed(() => {
  if (!props.chartData) return []
  // KST 기준 시간 추출
  return [...props.chartData].sort((a, b) => {
    const hourA = (new Date(a.timestamp).getUTCHours() + 9) % 24
    const hourB = (new Date(b.timestamp).getUTCHours() + 9) % 24
    return hourA - hourB
  })
})

const labels = computed(
  () =>
    sortedChartData.value.map(
      (d) => ((new Date(d.timestamp).getUTCHours() + 9) % 24).toString().padStart(2, '0') + '시',
    ) ?? [],
)
const dataSet = computed(() => sortedChartData.value.map((d) => d.usage_kwh) ?? [])
const totalUsage = computed(() =>
  (sortedChartData.value.reduce((sum, d) => sum + d.usage_kwh, 0) ?? 0).toFixed(2),
)
const totalCost = computed(() => Math.round(totalUsage.value * 120))

// 현재 시간 이전/이후 색상 구분 (KST 기준)
function getBarColors() {
  const now = new Date()
  const nowHourKST = (now.getUTCHours() + 9) % 24
  return (
    sortedChartData.value.map((d) => {
      const hourKST = (new Date(d.timestamp).getUTCHours() + 9) % 24
      return hourKST < nowHourKST ? '#3b82f6' : '#bae6fd'
    }) ?? []
  )
}

function renderChart() {
  if (chartInstance) {
    chartInstance.destroy()
  }
  chartInstance = new Chart(barChartRef.value, {
    type: 'bar',
    data: {
      labels: labels.value,
      datasets: [
        {
          label: '사용량 (kWh)',
          data: dataSet.value,
          backgroundColor: getBarColors(),
          borderRadius: 6,
          barPercentage: 0.95,
          categoryPercentage: 1.0,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#6b7280',
            font: { size: 12 },
            maxTicksLimit: 6, // x축에 최대 6개만 표시 (원하는 숫자로 조절)
            maxRotation: 0, // 라벨 기울이지 않음
            minRotation: 0,
          },
        },
        y: {
          grid: { color: '#e5e7eb' },
          ticks: { color: '#6b7280', font: { size: 12 } },
          beginAtZero: true,
        },
      },
    },
  })
}

onMounted(() => {
  renderChart()
})

watch(
  () => props.chartData,
  () => {
    renderChart()
  },
)
</script>
