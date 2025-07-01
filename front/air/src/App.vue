<!-- src/App.vue -->
<template>
  <div style="max-width: 480px; margin: 0 auto">
    <!-- RouterView는 현재 URL 경로에 맞는 컴포넌트(여기서는 HomeView.vue)를 렌더링합니다. -->
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>
