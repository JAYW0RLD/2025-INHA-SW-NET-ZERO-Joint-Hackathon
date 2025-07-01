<template>
  <div class="min-h-screen flex flex-col justify-center items-center bg-white">
    <div
      class="w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-10 border border-blue-100"
    >
      <div class="flex flex-col items-center mb-8">
        <div class="bg-gradient-to-tr from-blue-400 to-cyan-400 rounded-full p-3 shadow-lg mb-4">
          <span class="material-icons text-white text-4xl">settings</span>
        </div>
        <h2
          class="text-4xl font-extrabold text-blue-700 mb-2 text-center tracking-tight drop-shadow"
        >
          설정
        </h2>
        <p class="text-gray-500 mb-2 text-center">
          매장 정보를 입력하고<br class="md:hidden" />
          맞춤 에너지 관리를 시작하세요.
        </p>
      </div>
      <form class="space-y-12" @submit.prevent="handleSubmit">
        <!-- 첫 번째 묶음: 가게/냉방/소비 전력 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="flex flex-col items-center">
            <label class="block text-blue-700 font-semibold mb-2">가게 평수</label>
            <input
              type="number"
              v-model="storeSize"
              class="w-full border-2 border-cyan-200 rounded-xl px-4 py-3 text-black focus:ring-2 focus:ring-cyan-400 transition shadow-sm"
              placeholder="예: 20"
            />
          </div>
          <div class="flex flex-col items-center">
            <label class="block text-blue-700 font-semibold mb-2">소비 효율 등급</label>
            <select
              v-model="effective"
              class="w-full border-2 border-cyan-200 rounded-xl px-4 py-3 text-black focus:ring-2 focus:ring-cyan-400 transition shadow-sm"
            >
              <option value="" disabled selected>등급 선택</option>
              <option v-for="grade in [1, 2, 3, 4, 5]" :key="grade" :value="grade">
                {{ grade }}등급
              </option>
            </select>
          </div>
          <div class="flex flex-col items-center">
            <label class="block text-blue-700 font-semibold mb-2">정격 냉방량 (kW)</label>
            <input
              type="number"
              step="0.1"
              v-model="coolingCapacity"
              class="w-full border-2 border-cyan-200 rounded-xl px-4 py-3 text-black focus:ring-2 focus:ring-cyan-400 transition shadow-sm"
              placeholder="예: 5.0"
            />
          </div>
          <div class="flex flex-col items-center">
            <label class="block text-blue-700 font-semibold mb-2">정격 소비 전력 (kW)</label>
            <input
              type="number"
              step="0.1"
              v-model="maxPower"
              class="w-full border-2 border-cyan-200 rounded-xl px-4 py-3 text-black focus:ring-2 focus:ring-cyan-400 transition shadow-sm"
              placeholder="예: 1.5"
            />
          </div>
          <div class="flex flex-col items-center">
            <label class="block text-blue-700 font-semibold mb-2">최소 소비 전력 (kW)</label>
            <input
              type="number"
              step="0.1"
              v-model="minPower"
              class="w-full border-2 border-cyan-200 rounded-xl px-4 py-3 text-black focus:ring-2 focus:ring-cyan-400 transition shadow-sm"
              placeholder="예: 0.5"
            />
          </div>
        </div>
        <!-- 두 번째 묶음: 시간/온도 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="flex flex-col items-center">
            <label class="block text-blue-700 font-semibold mb-2">시작 시간</label>
            <input
              type="time"
              v-model="startTime"
              class="w-full border-2 border-cyan-200 rounded-xl px-4 py-3 text-black focus:ring-2 focus:ring-cyan-400 transition shadow-sm"
            />
          </div>
          <div class="flex flex-col items-center">
            <label class="block text-blue-700 font-semibold mb-2">종료 시간</label>
            <input
              type="time"
              v-model="endTime"
              class="w-full border-2 border-cyan-200 rounded-xl px-4 py-3 text-black focus:ring-2 focus:ring-cyan-400 transition shadow-sm"
            />
          </div>
          <div class="flex flex-col items-center">
            <label class="block text-blue-700 font-semibold mb-2">목표 온도 (℃)</label>
            <select
              v-model="targetTemp"
              class="w-full border-2 border-cyan-200 rounded-xl px-4 py-3 text-black focus:ring-2 focus:ring-cyan-400 transition shadow-sm"
            >
              <option v-for="temp in temps" :key="temp" :value="temp">{{ temp }}℃</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          class="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-bold text-xl shadow-xl hover:from-cyan-600 hover:to-blue-600 transition flex items-center justify-center gap-2"
        >
          <span class="material-icons align-middle text-2xl">save</span>
          설정 저장
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, inject } from 'vue'

const emit = defineEmits(['update-times', 'switch-tab'])

const storeSize = ref('')
const effective = ref('')
const coolingCapacity = ref('')
const ratedPower = ref('')
const minPower = ref('')
const startTime = ref('')
const endTime = ref('')
const targetTemp = ref('')

// 24시간 → 오전/오후 12시간 시계 변환 함수
function formatTo12Hour(time) {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const period = h < 12 ? '오전' : '오후'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${period} ${hour12.toString().padStart(2, '0')}시 ${m.toString().padStart(2, '0')}분`
}

// 모든 입력값이 바뀔 때마다 settingData 형태로 부모에 emit
watch(
  [effective, storeSize, coolingCapacity, ratedPower, minPower, startTime, endTime, targetTemp],
  ([newEffective, newStoreSize, newCooling, newRated, newMin, newStart, newEnd, newTarget]) => {
    emit('update-times', {
      effective: newEffective,
      storeSize: newStoreSize,
      coolingCapacity: newCooling,
      ratedPower: newRated,
      minPower: newMin,
      startTime: formatTo12Hour(newStart),
      endTime: formatTo12Hour(newEnd),
      targetTemp: newTarget,
    })
  },
)

const temps = Array.from({ length: 13 }, (_, i) => 18 + i) // 18~30

// HomeView에서 provide한 fetchMake_aircon 함수 주입
const fetchMake_aircon = inject('fetchMake_aircon')

function handleSubmit() {
  // 저장 시 감시 탭으로 전환 요청
  emit('switch-tab', 'monitor')
  // fetchMake_aircon이 있으면 실행
  if (fetchMake_aircon) {
    fetchMake_aircon()
  }
}
</script>
