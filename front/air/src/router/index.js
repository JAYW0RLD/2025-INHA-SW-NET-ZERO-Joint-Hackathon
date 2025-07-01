// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'

// 라우터 인스턴스를 생성합니다.
const router = createRouter({
  // HTML5 History API 모드를 사용하여 URL에서 해시(#)를 제거합니다.
  history: createWebHistory(import.meta.env.BASE_URL),
  
  // routes 배열: 어떤 경로에 어떤 컴포넌트를 보여줄지 정의합니다.
  routes: [
    {
      path: '/',
      name: 'Login',
      component: LoginView
    },
    {
      path: '/home',
      name: 'Home',
      component: HomeView
    }
    // 예시: 나중에 '정보' 페이지가 추가된다면 아래와 같이 추가할 수 있습니다.
    // {
    //   path: '/about',
    //   name: 'about',
    //   // '지연 로딩(lazy loading)' 방식. 해당 페이지에 처음 접속할 때만 컴포넌트를 로드합니다.
    //   component: () => import('../views/AboutView.vue')
    // }
  ]
})

// 생성한 라우터 인스턴스를 export하여 main.js에서 사용할 수 있도록 합니다.
export default router