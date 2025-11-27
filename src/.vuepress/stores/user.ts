import { ref, computed } from 'vue'

// User information interface based on Waline API
export interface UserInfo {
  display_name: string
  email: string
  url: string
  token: string
  avatar: string
  mailMd5: string
  objectId: number
  type: 'administrator' | 'guest'
}

// User state interface
interface UserState {
  user: UserInfo | null
  isLoggedIn: boolean
  token: string | null
  role: 'administrator' | 'guest' | null
}

// Storage keys for persistence
const STORAGE_KEYS = {
  USER: 'WALINE_USER',
  TOKEN: 'WALINE_TOKEN'
}

// Reactive state
const userState = ref<UserState>({
  user: null,
  isLoggedIn: false,
  token: null,
  role: null
})

// Initialize state from localStorage
const initializeFromStorage = () => {
  const storedUser = localStorage.getItem(STORAGE_KEYS.USER)
  const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)

  if (storedUser && storedToken) {
    try {
      const user = JSON.parse(storedUser)
      userState.value = {
        user,
        isLoggedIn: true,
        token: storedToken,
        role: user.type
      }
    } catch (error) {
      console.error('Failed to parse stored user data:', error)
      clearStorage()
    }
  }
}

// Clear storage
const clearStorage = () => {
  localStorage.removeItem(STORAGE_KEYS.USER)
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
}

// User store functions
export const useUserStore = () => {
  // Computed properties
  const user = computed(() => userState.value.user)
  const isLoggedIn = computed(() => userState.value.isLoggedIn)
  const token = computed(() => userState.value.token)
  const role = computed(() => userState.value.role)
  const isAdmin = computed(() => userState.value.role === 'administrator')

  // Actions
  const setUser = (userInfo: UserInfo, userToken: string) => {
    userState.value = {
      user: userInfo,
      isLoggedIn: true,
      token: userToken,
      role: userInfo.type
    }

    // Persist to localStorage
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userInfo))
    localStorage.setItem(STORAGE_KEYS.TOKEN, userToken)
  }

  const logout = () => {
    userState.value = {
      user: null,
      isLoggedIn: false,
      token: null,
      role: null
    }

    // Clear storage
    clearStorage()
  }

  const updateUser = (userInfo: Partial<UserInfo>) => {
    if (userState.value.user) {
      userState.value.user = { ...userState.value.user, ...userInfo }
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userState.value.user))
    }
  }

  // Initialize on first use
  if (!userState.value.user && !userState.value.token) {
    initializeFromStorage()
  }

  return {
    // State
    user,
    isLoggedIn,
    token,
    role,
    isAdmin,

    // Actions
    setUser,
    logout,
    updateUser
  }
}

// Export type for TypeScript
export type UserStore = ReturnType<typeof useUserStore>