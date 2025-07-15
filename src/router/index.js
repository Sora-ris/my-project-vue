// 管理页面url路由定向

import { createRouter, createWebHistory } from 'vue-router';
import store from '@/store';            // 存储用户登录信息
// url页面注册
import Login from '@/views/Login.vue';
import Home from '@/views/Home.vue';


const routes = [
  { 
    path: '/', 
    redirect: '/home' 
  },
  { 
    path: '/login', 
    component: Login,
    meta: { requiresGuest: true } 
  },
  { 
    path: '/home', 
    component: Home,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = store.state.isAuthenticated;
  // console.log('router.beforeEach ' + isAuthenticated)
  // 已认证时访问游客页面，重定向到首页
  if (to.meta.requiresGuest && isAuthenticated) {
    next('/home');
  } 
  // 需认证页面但未登录，重定向到登录页
  else if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } 
  // 其他情况放行
  else {
    next();
  }
  
});

export default router;