<template>
  <div
    class="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-blue-100 to-blue-300"
  >
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xs flex flex-col items-center">
      <img src="@/assets/logo1.png" alt="로고" class="w-60 h-60 mb-7" />
      <h1 class="text-2xl font-bold mb-2 text-blue-700">에너지 관리 시스템</h1>
      <p class="text-gray-500 mb-6 text-center">로그인 후 서비스를 이용하세요</p>
      <form class="w-full space-y-4" @submit.prevent="handleLogin">
        <div>
          <label class="block text-gray-700 mb-1 text-sm">아이디</label>
          <input
            v-model="userId"
            type="text"
            class="w-full border rounded px-3 py-2 text-black"
            placeholder="아이디 입력"
            required
          />
        </div>
        <div>
          <label class="block text-gray-700 mb-1 text-sm">비밀번호</label>
          <input
            v-model="password"
            type="password"
            class="w-full border rounded px-3 py-2 text-black"
            placeholder="비밀번호 입력"
            required
          />
        </div>
        <button
          type="submit"
          class="w-full py-2 bg-blue-500 text-white rounded font-bold shadow mt-2"
        >
          로그인
        </button>
      </form>
      <div class="mt-4 text-xs text-gray-400">ⓒ 2025 Energy AI</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const userId = ref('')
const password = ref('')

function handleLogin() {
  // 실제 로그인 로직은 필요에 따라 구현
  if (userId.value && password.value) {
    // 예시: 로그인 성공 시 메인 페이지로 이동
    window.location.href = '/home'
  } else {
    alert('아이디와 비밀번호를 입력하세요.')
  }
}
</script>
