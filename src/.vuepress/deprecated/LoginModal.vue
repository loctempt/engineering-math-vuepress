<template>
  <div v-if="isVisible" class="login-modal-overlay" @click="closeModal">
    <div class="login-modal" @click.stop>
      <div class="login-modal-header">
        <h3>登录</h3>
        <button class="close-button" @click="closeModal" aria-label="关闭">
          <i-fa6-solid-xmark />
        </button>
      </div>

      <div class="login-modal-body">
        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">邮箱</label>
            <input
              id="email"
              v-model="credentials.email"
              type="text"
              placeholder="请输入邮箱"
              required
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <label for="password">密码</label>
            <input
              id="password"
              v-model="credentials.password"
              type="password"
              placeholder="请输入密码"
              required
              :disabled="isLoading"
            />
          </div>

          <div class="form-options">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="credentials.remember"
                :disabled="isLoading"
              />
              <span>记住我</span>
            </label>
          </div>

          <button
            type="submit"
            class="login-button"
            :disabled="isLoading || !isFormValid"
          >
            <span v-if="isLoading">登录中...</span>
            <span v-else>登录</span>
          </button>
        </form>

        <!-- Error Message -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- Social Login Section (Placeholder for future implementation) -->
        <div class="social-login-section">
          <div class="divider">
            <span>或使用第三方登录</span>
          </div>
          <div class="social-buttons">
            <button class="social-button" disabled>
              <i-fa6-brands-github />
              GitHub
            </button>
            <button class="social-button" disabled>
              <i-fa6-brands-google />
              Google
            </button>
            <button class="social-button" disabled>
              <i-fa6-brands-weixin />
              微信
            </button>
          </div>
          <p class="social-note">第三方登录功能待配置</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useUserStore } from '../stores/user'
import authService, { type LoginCredentials } from '../services/auth'

// Props
interface Props {
  modelValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'login-success': []
  'login-error': [error: string]
}>()

// State
const userStore = useUserStore()
const isLoading = ref(false)
const errorMessage = ref('')

// Form data
const credentials = reactive<LoginCredentials>({
  email: '',
  password: '',
  remember: false
})

// Computed
const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isFormValid = computed(() => {
  return credentials.email.trim() && credentials.password.trim()
})

// Methods
const closeModal = () => {
  isVisible.value = false
  resetForm()
}

const resetForm = () => {
  credentials.email = ''
  credentials.password = ''
  credentials.remember = false
  errorMessage.value = ''
  isLoading.value = false
}

const handleLogin = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const result = await authService.login(credentials)

    // Update user store
    userStore.setUser(result.user, result.token)

    // Emit success event
    emit('login-success')

    // Close modal
    closeModal()

    console.log('Login successful:', result.user.display_name)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '登录失败，请重试'
    errorMessage.value = errorMsg
    emit('login-error', errorMsg)
    console.error('Login failed:', error)
  } finally {
    isLoading.value = false
  }
}

// Watch for modal visibility changes
import { watch } from 'vue'
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    resetForm()
  }
})
</script>

<style scoped>
.login-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.login-modal {
  background: var(--vp-c-bg);
  border-radius: 8px;
  padding: 0;
  width: 90%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--vp-c-divider);
}

.login-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.login-modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--vp-c-text-2);
  border-radius: 4px;
  transition: color 0.2s, background-color 0.2s;
}

.close-button:hover {
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg-soft);
}

.login-modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--vp-c-brand);
}

.form-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-options {
  margin-bottom: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.checkbox-label input {
  margin: 0;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background: var(--vp-c-brand);
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-button:hover:not(:disabled) {
  background: var(--vp-c-brand-dark);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--vp-c-red-soft);
  color: var(--vp-c-red);
  border-radius: 4px;
  font-size: 0.9rem;
}

.social-login-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--vp-c-divider);
}

.divider {
  text-align: center;
  margin-bottom: 1rem;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.divider span {
  background: var(--vp-c-bg);
  padding: 0 1rem;
}

.social-buttons {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.social-button {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  border-radius: 4px;
  cursor: not-allowed;
  opacity: 0.5;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.social-note {
  text-align: center;
  color: var(--vp-c-text-3);
  font-size: 0.8rem;
  margin: 0;
}

/* Responsive */
@media (max-width: 480px) {
  .login-modal {
    width: 95%;
    margin: 1rem;
  }

  .social-buttons {
    flex-direction: column;
  }
}
</style>