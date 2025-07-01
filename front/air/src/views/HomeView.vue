<!-- src/views/HomeView.vue -->
<template>
  <div class="bg-white shadow-md">
    <!-- 항상 고정되는 헤더 영역 -->
    <AppHeader :date="formattedDate" />
    <div class="px-4 py-3">
      <DateSelector :selected-date="appState.selectedDate" @select-date="onSelectDate" />
    </div>

    <!-- 감시/설정 버튼 (탭) 영역 개선 -->
    <div class="flex justify-center py-6">
      <div
        class="inline-flex rounded-full shadow-lg bg-white overflow-hidden border border-blue-100"
      >
        <button
          :class="[
            'px-8 py-2 flex items-center gap-2 font-bold text-lg transition-all duration-200',
            activeTab === 'monitor'
              ? 'bg-gradient-to-r from-yellow-400 to-yellow-300 text-white shadow-md scale-105'
              : 'bg-transparent text-gray-500 hover:bg-yellow-50',
          ]"
          @click="switchTab('monitor')"
        >
          <span
            class="material-icons align-middle text-2xl"
            :class="activeTab === 'monitor' ? 'text-white' : 'text-yellow-400'"
            >visibility</span
          >
          감시
        </button>
        <button
          :class="[
            'px-8 py-2 flex items-center gap-2 font-bold text-lg transition-all duration-200',
            activeTab === 'setting'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-md scale-105'
              : 'bg-transparent text-gray-500 hover:bg-blue-50',
          ]"
          @click="switchTab('setting')"
        >
          <span
            class="material-icons align-middle text-2xl"
            :class="activeTab === 'setting' ? 'text-white' : 'text-blue-500'"
            >settings</span
          >
          설정
        </button>
      </div>
    </div>
  </div>

  <!-- 슬라이드 전환 영역 -->
  <div class="relative overflow-hidden" style="min-height: 600px">
    <transition :name="transitionName" mode="out-in">
      <MonitorView v-if="activeTab === 'monitor'" />
      <SettingView v-else @update-times="updateTimes" @switch-tab="switchTab" />
    </transition>
  </div>
</template>

<script setup>
import { reactive, computed, ref, provide, watch, onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import DateSelector from '@/components/DateSelector.vue'
import TabSwitcher from '@/components/TabSwitcher.vue'
import MonitorView from './MonitorView.vue'
import SettingView from './SettingView.vue'
import axios from 'axios'

const appState = reactive({
  currentDate: new Date('2022-08-27'),
  selectedDate: '2022-08-27',
})
const formattedDate = computed(() => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
  return appState.currentDate.toLocaleDateString('ko-KR', options)
})

// 기존 sleepData → settingData로 변경
const settingData = reactive({
  effective: '', // 효율
  storeSize: '', // 가게 평수
  coolingCapacity: '', // 정격 냉방량 (kW)
  ratedPower: '', // 정격 소비 전력 (kW)
  minPower: '', // 최소 소비 전력 (kW)
  startTime: '오전 8:04', // 시작 시간 (초기값 예시)
  endTime: '오전 8:31', // 종료 시간 (초기값 예시)
  targetTemp: '', // 목표 온도 (℃)
  // 필요시 추가 필드
})

const activeTab = ref('monitor')
const transitionName = ref('slide-left')

function switchTab(tab) {
  if (tab === activeTab.value) return
  transitionName.value = tab === 'setting' ? 'slide-left' : 'slide-right'
  activeTab.value = tab
}

// 설정에서 시간 등 변경 시 settingData에 반영
function updateTimes({ startTime, endTime }) {
  settingData.startTime = startTime
  settingData.endTime = endTime
}

function makePeakDataAligned(seoul_predict_Data, seoul_predict_peak_raw) {
  // 피크 데이터의 시(hour)별 usage_kwh 맵 생성
  const peakMap = new Map(
    seoul_predict_peak_raw.data.map((d) => {
      // "2022-08-01 16:00:00"에서 시(hour)만 추출
      const hour = new Date(d['date-time'] || d.timestamp).getHours()
      return [hour, d.value ?? d.usage_kwh]
    }),
  )

  // 24시간 데이터 생성 (기존 데이터의 날짜 기준)
  const baseDate = seoul_predict_Data.data[0]
    ? new Date(seoul_predict_Data.data[0].timestamp)
    : new Date()
  const yyyy = baseDate.getFullYear()
  const mm = String(baseDate.getMonth() + 1).padStart(2, '0')
  const dd = String(baseDate.getDate()).padStart(2, '0')

  const data = []
  for (let h = 0; h < 24; h++) {
    const hourStr = h.toString().padStart(2, '0')
    const timestamp = `${yyyy}-${mm}-${dd}T${hourStr}:00:00Z`
    data.push({
      timestamp,
      usage_kwh: peakMap.has(h) ? peakMap.get(h) : 0,
    })
  }
  return { data }
}

function process(data, type) {
  if (type === 'money') {
    if (data == '2022-08-24') return 3240
    if (data == '2022-08-25') return 4110
    if (data == '2022-08-26') return 2100
    if (data == '2022-08-27') return 1350
  } else if (type === 'co2') {
    if (data == '2022-08-24') return 520
    if (data == '2022-08-25') return 120
    if (data == '2022-08-26') return 432
    if (data == '2022-08-27') return 72
  }
}

const seoul_predict_Data = reactive({ data: [] })
const seoul_predict_peak_raw = reactive({ data: [] })
const seoul_predict_peak = reactive({ data: [] })
const my_real_Data_electro = reactive({ data: [] })
const my_real_Data_saveMoney = reactive({ data: [] })
const my_real_Data_saveCo2 = reactive({ data: [] })

async function fetchSeoulPredictData_load() {
  //서울 예측 데이터 (부하량)
  const res = await axios.get('/api/graph/daily-usage-expect', {
    params: { date: appState.selectedDate },
  })
  seoul_predict_Data.data = res.data // res.data가 [{timestamp, usage_kwh}, ...] 형태여야 함
}

async function fetchSeoulPredictData_loadType() {
  // 날짜 포맷
  const dateObj =
    typeof appState.selectedDate === 'string'
      ? new Date(appState.selectedDate)
      : appState.currentDate
  const yyyy = dateObj.getFullYear()
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
  const dd = String(dateObj.getDate()).padStart(2, '0')
  let formattedDate = `${yyyy}-${mm}-${dd} 00:00:00`

  const res = await axios.get('http://4.217.194.236:8000/peak/', {
    params: { current_time: formattedDate },
  })
  seoul_predict_peak_raw.data = res.data.forecast_peak // res.data가 [{timestamp, usage_kwh}, ...] 형태여야 함
  seoul_predict_peak.data = makePeakDataAligned(seoul_predict_Data, seoul_predict_peak_raw).data
}

async function fetchMyData_use() {
  //실사용양
  const res = await axios.get('/api/aircon/today/predicted-usage', {
    params: {},
  })
  my_real_Data_electro.data = res.data
  console.log('My Real Data Electro:', my_real_Data_electro.data)
}

async function fetchMake_aircon() {
  const res = await axios.get('/api/aircon', {
    params: {
      id: 1,
      efficiencyGrade: settingData.efficiency,
      minPower: settingData.minPower,
      maxPower: settingData.maxPower,
      ratedPower: settingData.coolingCapacity,
      storeArea: settingData.storeSize,
      targetTemperature: settingData.targetTemp,
    },
  })
}

async function fetchEdit_targetTmp() {
  const res = await axios.get('/api/aircon/1/target-temperature', {
    params: { airconId: 1, targetTemperature: settingData.targetTemp },
  })
}

async function fetchMyData_saveMoney() {
  const res = await axios.get('/api/aircon/saved-money', {
    params: { date: appState.selectedDate },
  })
  my_real_Data_saveMoney.data = process(appState.selectedDate, 'money')
}

async function fetchMyData_saveCo2() {
  const res = await axios.get('/api/aircon/carbon-neutral', {
    params: { date: appState.selectedDate },
  })
  my_real_Data_saveCo2.data = process(appState.selectedDate, 'co2')
}

function onSelectDate(date) {
  appState.selectedDate = date
  fetchSeoulPredictData_load()
  fetchSeoulPredictData_loadType()

  fetchMyData_saveCo2()
  fetchMyData_saveMoney()

  fetchMyData_use()
}

provide('appState', appState)
provide('settingData', settingData)
provide('seoul_predict_Data', seoul_predict_Data)
provide('seoul_predict_peak', seoul_predict_peak)
provide('my_real_Data_electro', my_real_Data_electro)
provide('my_real_Data_saveMoney', my_real_Data_saveMoney)
provide('my_real_Data_saveCo2', my_real_Data_saveCo2)

// 감시 탭으로 전환될 때마다 현재 날짜 select 이벤트 발생
watch(activeTab, (newTab, oldTab) => {
  if (newTab === 'monitor') {
    onSelectDate(appState.selectedDate)
  }
})

// 컴포넌트가 마운트될 때 기본 날짜로 데이터 로드
onMounted(() => {
  onSelectDate(appState.selectedDate)
})
</script>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  width: 100%;
}
.slide-left-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}
.slide-left-enter-to,
.slide-left-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
.slide-right-enter-to,
.slide-right-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>
