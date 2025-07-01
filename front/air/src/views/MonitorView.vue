<template>
  <div>
    <div class="bg-white px-2 py-4 text-center">
      <div>
        <CostDistributionBar />
      </div>
      <div class="space-y-3">
        <InfoCard
          icon="av_timer"
          icon-color="text-blue-500"
          title="돈을 아낀 전력 부하 시간대"
          :has-info="true"
          value="2회 / 좋음"
          value-color="text-blue-500"
        />
        <InfoCard
          icon="savings"
          icon-color="text-green-500"
          title="오늘 절약한 금액"
          :value="my_real_Data_saveMoney.data"
          value-color="text-green-500"
        />
        <InfoCard
          icon="co2"
          icon-color="text-blue-500"
          title="오늘 실천한 탄소 중립"
          :value="my_real_Data_saveCo2.data"
          value-color="text-blue-500"
        />
      </div>

      <div class="py-6"></div>
      <div class="grid grid-cols-2 gap-4 px-4 py-6">
        <AlarmTimeCard
          icon="alarm"
          icon-color="text-red-500"
          title="오늘 맞춤 시작 시간"
          :time="sleepData.startTime"
        />
        <AlarmTimeCard
          icon="alarm_on"
          icon-color="text-yellow-500"
          title="오늘 맞춤 종료 시간"
          :time="sleepData.endTime"
        />
      </div>

      <div class="py-8"></div>

      <AlldayBarChart :chartData="seoul_predict_Data.data" totalSleep="-" />
      <RealdayBarChart
        :chartData="seoul_predict_Data.data"
        :chartDataPeak="seoul_predict_peak.data"
        totalSleep="-"
      />

      <div class="py-2"></div>
      <div class="py-4"></div>

      <SleepPatternChart :pattern-data="sleepData.patterns" />
    </div>
  </div>
</template>

<script setup>
import AlldayBarChart from '@/components/AlldayBarChart.vue'
import RealdayBarChart from '@/components/RealdayBarChart.vue'
import InfoCard from '@/components/InfoCard.vue'
import AlarmTimeCard from '@/components/AlarmTimeCard.vue'
import CostDistributionBar from '@/components/CostDistributionBar.vue'
import SleepPatternChart from '@/components/SleepPatternChart.vue'
import { inject, ref, watch } from 'vue'

const sleepData = inject('settingData')
const seoul_predict_Data = inject('seoul_predict_Data')
const seoul_predict_peak = inject('seoul_predict_peak')
const my_real_Data_electro = inject('my_real_Data_electro')
const my_real_Data_saveMoney = inject('my_real_Data_saveMoney')
const my_real_Data_saveCo2 = inject('my_real_Data_saveCo2')
const appState = inject('appState') // HomeView에서 provide 필요

// 최초 1회, 그리고 날짜가 바뀔 때마다 실행
watch(() => appState.selectedDate, { immediate: true })
</script>
