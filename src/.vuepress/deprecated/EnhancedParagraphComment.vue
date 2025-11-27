<template>
  <div class="paragraph-comment">
    <ClientOnly>
      <div v-if="showWaline" ref="walineRef" :pageId="pageId"></div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import '@waline/client/style';
import { onBeforeUnmount, ref, nextTick, computed, watch } from 'vue';
import { init, WalineMeta } from '@waline/client';
import { useUserStore } from '../stores/user';

const serverURL = 'https://waline.fantastic-mathematics.work/'
const props = defineProps({
  pageId: String, // 段落唯一 ID
})

const userStore = useUserStore()
const showWaline = ref(true);
const walineRef = ref<HTMLDivElement>();
let walineInstance: ReturnType<typeof init> | null = null

// Computed configuration that automatically adapts to authentication state
const walineConfig = computed(() => {
  const baseConfig = {
    serverURL: serverURL,
    path: props.pageId,
    dark: 'html[data-theme="dark"]',
  }

  // If user is logged in, inject token and hide login fields
  if (userStore.isLoggedIn.value && userStore.token.value) {
    return {
      ...baseConfig,
      token: userStore.token.value,
      login: 'disable' as const, // Hide login fields since user is already authenticated
      meta: [] as WalineMeta[] // Don't show nickname/email fields
    }
  }

  // If user is not logged in, show login fields
  return {
    ...baseConfig,
    login: 'disable' as const, // Show login fields
    meta: ['nick', 'mail'] as WalineMeta[]// Show nickname and email fields
  }
})

// Initialize Waline with authentication-aware configuration
const initWaline = () => {
  if (!walineRef.value) return

  // Destroy existing instance if any
  if (walineInstance) {
    walineInstance = null
  }

  walineInstance = init({
    el: walineRef.value,
    lang: 'zh',
    ...walineConfig.value
  })

  console.log(`[EnhancedParagraphComment] Initialized Waline for ${props.pageId} with auth: ${userStore.isLoggedIn.value ? 'authenticated' : 'not authenticated'}`)
}

// Watch for authentication state changes and reinitialize Waline
watch(
  () => userStore.isLoggedIn,
  (newAuthState) => {
    console.log(`[EnhancedParagraphComment] Authentication state changed to: ${newAuthState}`)
    if (walineRef.value) {
      // Reinitialize Waline when authentication state changes
      nextTick(() => {
        initWaline()
      })
    }
  }
)

// Watch for token changes and reinitialize
watch(
  () => userStore.token,
  (newToken) => {
    if (newToken && walineRef.value) {
      console.log(`[EnhancedParagraphComment] Token updated, reinitializing Waline`)
      nextTick(() => {
        initWaline()
      })
    }
  }
)

/* Initialize on mount */
nextTick(() => {
  initWaline()
})

/* Cleanup on unmount */
onBeforeUnmount(() => {
  if (walineInstance) {
    walineInstance = null
  }
  showWaline.value = false
})
</script>

<style scoped>
.paragraph-comment {
  margin-top: 1rem;
}
</style>

<style>
/* 浅色模式 */
:root {
  /* 让 Waline 的主色 = 主题当前色 */
  --waline-theme-color: #0756ab !important;
  --waline-active-color: #217ddf !important;
}

/* 深色模式（hope 用 html[data-theme="dark"]） */
html[data-theme="dark"] {
  --waline-theme-color: #0756ab !important;
  --waline-active-color: #217ddf !important;
}

.paragraph-comment {
  background-color: rgb(251, 251, 251);
  border-radius: 2px;
}

html[data-theme="dark"] .paragraph-comment{
  background-color: #242429;

}
</style>