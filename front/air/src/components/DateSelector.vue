<template>
  <div class="flex justify-around text-center text-sm text-gray-500 mb-4">
    <div
      v-for="day in days"
      :key="day.date"
      @click="$emit('select-date', day.date)"
      :class="{ 'text-blue-600 font-semibold': selectedDate === day.date, 'cursor-pointer': true }"
    >
      <p>{{ formatDisplay(day.date) }}</p>
      <span
        v-if="day.hasDot"
        :class="[
          'inline-block w-1.5 h-1.5 rounded-full',
          selectedDate === day.date ? 'bg-blue-500' : 'bg-yellow-400',
        ]"
      ></span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  selectedDate: String, // 날짜를 'YYYY-MM-DD' 형식으로 받음
})
defineEmits(['select-date'])

// 날짜 목록을 'YYYY-MM-DD' 형식으로 저장
const days = ref([
  { date: '2022-08-24', hasDot: true },
  { date: '2022-08-25', hasDot: true },
  { date: '2022-08-26', hasDot: true },
  { date: '2022-08-27', hasDot: true },
  { date: '2022-08-28', hasDot: false },
  { date: '2022-08-29', hasDot: false },
  { date: '2022-08-30', hasDot: false },
])

// 화면에 표시할 때는 일(day)만 보여줌
function formatDisplay(dateStr) {
  return new Date(dateStr).getDate()
}
</script>
