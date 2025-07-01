<template>
  <div class="bg-white p-4 rounded-xl shadow text-center">
    <span class="material-icons mb-1" :class="iconColor">{{ icon }}</span>
    <p class="text-sm text-gray-700 font-medium">{{ title }}</p>
    <p class="text-lg text-gray-900">{{ time }}</p>
  </div>
</template>

<script setup>
defineProps({
  icon: String,
  iconColor: String,
  title: String,
  time: String,
});
</script>