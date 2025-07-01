<template>
  <div class="flex justify-center bg-gray-200 p-1 rounded-full mb-4">
    <button 
      @click="$emit('switch-tab', 'sleep')"
      :class="['flex-1 py-2 px-4 rounded-full text-sm text-gray-700', { 'bg-white shadow': activeTab === 'sleep' }]"
    >
      수면
    </button>
    <button 
      @click="$emit('switch-tab', 'wake')"
      :class="['flex-1 py-2 px-4 rounded-full text-sm text-gray-700', { 'bg-white shadow': activeTab === 'wake' }]"
    >
      기상
    </button>
  </div>
</template>

<script setup>
defineProps({
  activeTab: String,
});
defineEmits(['switch-tab']);
</script>