<template>
  <div class="px-2 pt-6">
    <div class="bg-white p-4 rounded-xl shadow-2xl">
      <div class="flex justify-between items-center mb-2">
        <div class="text-left mx-8">
          <h2 class="text-lg font-semibold text-gray-800">부하에 따른 전기 사용량</h2>
          <div class="text-sm text-gray-800">*하루 종일 사용할 전력을 확인해요.</div>
        </div>
        <div class="flex items-center text-sm text-gray-500">
          <span class="material-icons text-red-500 mr-1">electrical_services</span>
          <span>{{ totalSleep }}</span>
        </div>
      </div>
      <canvas ref="barChartRef" height="90"></canvas>
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
  chartDataPeak: Array, // 피크 구간 데이터 추가
  totalSleep: String,
})

const barChartRef = ref(null)
let chartInstance = null

const labels = computed(
  () =>
    props.chartData?.map(
      (d) => new Date(d.timestamp).getUTCHours().toString().padStart(2, '0') + '시',
    ) ?? [],
)
const dataSet = computed(() => props.chartData?.map((d) => d.usage_kwh) ?? [])
const peakSet = computed(() => props.chartDataPeak?.map((d) => d.usage_kwh) ?? [])
const totalUsage = computed(() =>
  (props.chartData?.reduce((sum, d) => sum + d.usage_kwh, 0) ?? 0).toFixed(2),
)
const totalCost = computed(() => Math.round(totalUsage.value * 120))

// 현재 시간 이전/이후 색상 구분 (선 그래프에서는 점 색상 등으로 활용 가능)
function getPointColors() {
  const now = new Date()
  const nowHour = now.getUTCHours()
  return (
    props.chartData?.map((d) => {
      const hour = new Date(d.timestamp).getUTCHours()
      return hour < nowHour ? '#3b82f6' : '#bae6fd'
    }) ?? []
  )
}

function renderChart() {
  if (chartInstance) {
    chartInstance.destroy()
  }
  chartInstance = new Chart(barChartRef.value, {
    type: 'bar', // bar로 두고 datasets에서 type을 섞어 사용
    data: {
      labels: labels.value,
      datasets: [
        {
          type: 'line',
          label: '사용량 (kWh)',
          data: dataSet.value,
          fill: false,
          borderColor: '#3b82f6',
          backgroundColor: '#3b82f6',
          pointBackgroundColor: getPointColors(),
          pointBorderColor: getPointColors(),
          tension: 0.3,
          order: 2,
        },
        {
          type: 'bar',
          label: '피크 구간',
          data: peakSet.value,
          backgroundColor: '#ef4444',
          borderRadius: 6,
          barPercentage: 0.95,
          categoryPercentage: 1.0,
          order: 1,
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
          ticks: { color: '#6b7280', font: { size: 12 } },
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
  () => [props.chartData, props.chartDataPeak],
  () => {
    renderChart()
  },
)
</script>
