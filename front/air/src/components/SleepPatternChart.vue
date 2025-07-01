<template>
  <div class="px-4 py-2 rounded-b-3xl">
    <div class="bg-white p-4 rounded-xl shadow">
      <h2 class="text-lg font-semibold text-gray-800 mb-3">시간대별 예상 전력 부하도</h2>
      <div class="w-full h-10 bg-gray-200 rounded-md flex overflow-hidden">
        <!-- v-for와 :style, :class를 이용한 동적 패턴 렌더링 -->
        <div
          v-for="(pattern, index) in patternData"
          :key="index"
          class="h-full"
          :class="[getPatternClass(pattern), getEventClass(pattern)]"
          :style="{ width: pattern.width + '%' }"
        ></div>
      </div>
      <div class="flex justify-between text-xs text-gray-500 mt-2">
        <span v-for="h in [0, 6, 12, 18, 24]" :key="h">{{ h.toString().padStart(2, '0') }}:00</span>
      </div>
      <!-- 범례 -->
      <div class="mt-4 space-y-2">
        <div
          v-for="legend in legends"
          :key="legend.label + legend.class + (legend.type ?? '') + (legend.event ?? '')"
          class="flex items-center text-sm"
        >
          <span :class="legend.class" class="mr-2"></span>
          <span class="text-gray-700">
            {{ legend.label }}
            <span v-if="legend.timeRanges && legend.timeRanges.length">
              (
              <template v-for="(tr, idx) in legend.timeRanges">
                <span>{{ tr[0] }}~{{ tr[1] }}시</span
                ><span v-if="idx < legend.timeRanges.length - 1">, </span>
              </template>
              )
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 1. seoul_predict_peak를 props로 받기
const props = defineProps({
  seoul_predict_peak: {
    type: Array,
    default: () => [],
  },
})

// 2. 피크 시간 범위 계산 (KST 기준)
const peakTimeRange = computed(() => {
  if (!props.seoul_predict_peak.length) return [12, 13.5] // 기본값
  const hours = props.seoul_predict_peak.map((d) => (new Date(d.timestamp).getUTCHours() + 9) % 24)
  const min = Math.min(...hours)
  const max = Math.max(...hours) + 1 // 끝 시간 포함
  return [min, max]
})

// 3. rawLegends에서 '높은 탄소 부하'의 timeRange를 동적으로 할당
const rawLegends = computed(() => [
  {
    label: '높은 탄소 부하',
    class: 'w-3 h-3 bg-red-400 rounded-full',
    type: 'rem',
    timeRange: peakTimeRange.value,
  },
  {
    label: '높은 가격 부하',
    class: 'w-3 h-3 bg-yellow-400 rounded-full',
    type: 'rem',
    timeRange: [11, 12],
  },
  {
    label: '높은 가격 부하',
    class: 'w-3 h-3 bg-yellow-400 rounded-full',
    type: 'rem',
    timeRange: [13, 18],
  },
  {
    label: '중간 가격 부하',
    class: 'w-3 h-3 bg-blue-300 rounded-full',
    type: 'light',
    timeRange: [8, 22],
  },
  {
    label: '높은 가격 부하',
    class: 'w-3 h-3 bg-yellow-400 rounded-full',
    type: 'rem',
    timeRange: [9, 10.5],
  },
  {
    label: '중간 가격 부하',
    class: 'w-3 h-3 bg-blue-300 rounded-full',
    type: 'light',
    timeRange: [6, 11],
  },
  {
    label: '낮은 부하',
    class: 'w-3 h-3 bg-blue-500 rounded-full',
    type: 'deep',
    timeRange: [0, 24],
  },
])

// label+class+type+event가 같으면 timeRange만 합침
const legends = computed(() => {
  const map = new Map()
  for (const l of rawLegends.value) {
    const key = [l.label, l.class, l.type ?? '', l.event ?? ''].join('|')
    if (!map.has(key)) {
      map.set(key, { ...l, timeRanges: [l.timeRange] })
    } else {
      map.get(key).timeRanges.push(l.timeRange)
    }
  }
  return Array.from(map.values())
})

// 0.1시간(6분) 단위로 패턴 생성
const patternData = computed(() => {
  const patterns = []
  const step = 1 // 1시간 단위
  for (let t = 0; t < 24; t += step) {
    const legend = rawLegends.value.find(
      (l) => l.timeRange && t >= l.timeRange[0] && t < l.timeRange[1],
    )
    if (legend) {
      patterns.push({
        ...legend, // label, class 등 모두 포함
        width: (step / 24) * 100, // 전체 100% 중에서 step만큼
        hour: t,
      })
    }
  }
  return patterns
})

const getPatternClass = (pattern) => {
  // label이 '높은 탄소 부하'면 빨강, 아니면 기존대로
  if (pattern.label === '높은 탄소 부하') return 'bg-red-400'
  switch (pattern.type) {
    case 'deep':
      return 'bg-blue-500'
    case 'light':
      return 'bg-blue-300'
    case 'rem':
      return 'bg-yellow-400'
    default:
      return 'bg-gray-200'
  }
}

const getEventClass = (pattern) => {
  if (!pattern.event) return ''
  switch (pattern.event) {
    case 'snore':
      return 'border-l-2 border-red-500'
    case 'apnea':
      return 'border-l-2 border-orange-500'
    default:
      return ''
  }
}
</script>

<style scoped>
/* 추가적인 스타일이 필요하면 여기에 작성 */
</style>
