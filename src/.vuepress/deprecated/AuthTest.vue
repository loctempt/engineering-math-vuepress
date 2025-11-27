<template>
  <div class="auth-test">
    <h3>Authentication Test</h3>

    <div v-if="!isLoggedIn" class="auth-status">
      <p>您尚未登录</p>
      <button @click="showLogin" class="login-btn">登录</button>
    </div>

    <div v-else class="auth-status">
      <p>欢迎，{{ user?.display_name }}！</p>
      <p>邮箱：{{ user?.email }}</p>
      <p>角色：{{ role === 'administrator' ? '管理员' : '普通用户' }}</p>
      <button @click="handleLogout" class="logout-btn">退出登录</button>
    </div>

    <LoginModal v-model="showModal" @login-success="onLoginSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../stores/user'
import authService, { type LoginCredentials } from '../services/auth'

const userStore = useUserStore()
const showModal = ref(false)

// Computed properties
const isLoggedIn = userStore.isLoggedIn
const user = userStore.user
const role = userStore.role

// Methods
const showLogin = () => {
  // showModal.value = true
  handleLogin()
}

const handleLogin = async () => {

  try {
    const result = await authService.login()

    // Update user store
    userStore.setUser(result.user, result.token)

    console.log('Login successful:', result.user.display_name)
    location.reload();
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '登录失败，请重试'
    console.error('Login failed:', error)
  }
}

const handleLogout = () => {
  userStore.logout()
  location.reload();
}

const onLoginSuccess = () => {
  console.log('Login successful!')
}
</script>

<style scoped>
.auth-test {
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  margin: 1rem 0;
  background: var(--vp-c-bg-soft);
}

.auth-test h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--vp-c-text-1);
}

.auth-status p {
  margin: 0.5rem 0;
  color: var(--vp-c-text-2);
}

.login-btn,
.logout-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--vp-c-brand);
  background: var(--vp-c-brand);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-btn:hover,
.logout-btn:hover {
  background: var(--vp-c-brand-dark);
}

.logout-btn {
  background: var(--vp-c-red);
  border-color: var(--vp-c-red);
}

.logout-btn:hover {
  background: var(--vp-c-red-dark);
}
</style>