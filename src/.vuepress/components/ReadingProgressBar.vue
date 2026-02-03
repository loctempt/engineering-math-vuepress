<template>
  <ClientOnly>
    <div class="reading-progress-bar" :style="{ width: `${progress}%` }"></div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vuepress/client'
import { useReadingProgressStore, initializeReadingProgress } from '../stores/reading-progress'

const route = useRoute()
const progress = ref(0)
let store: ReturnType<typeof useReadingProgressStore> | null = null

// 节流函数
const throttle = <T extends (...args: unknown[]) => void>(fn: T, delay: number): T => {
  let lastCall = 0
  return ((...args: unknown[]) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      fn(...args)
    }
  }) as T
}

// 计算滚动进度
const calculateProgress = (): number => {
  if (typeof window === 'undefined') return 0

  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const scrollHeight = document.documentElement.scrollHeight
  const clientHeight = document.documentElement.clientHeight

  if (scrollHeight <= clientHeight) {
    return 100
  }

  const maxScroll = scrollHeight - clientHeight
  return Math.min(100, Math.round((scrollTop / maxScroll) * 100))
}

// 获取页面ID
const getPageId = (): string => route.path || 'unknown'

// 滚动处理
const handleScroll = throttle(() => {
  const currentProgress = calculateProgress()
  progress.value = currentProgress

  // 保存进度
  if (store) {
    const pageId = getPageId()
    if (pageId !== 'unknown') {
      store.updateProgress(pageId, currentProgress)
    }
  }
}, 100)

onMounted(() => {
  initializeReadingProgress()
  store = useReadingProgressStore()

  // 初始进度
  progress.value = calculateProgress()

  // 监听滚动
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 路由变化时重置
watch(() => route.path, () => {
  progress.value = calculateProgress()
})
</script>

<style scoped>
.reading-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  z-index: 9999;
  transition: width 0.1s ease-out;
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
}

/* 深色模式适配 */
html[data-theme="dark"] .reading-progress-bar {
  background: linear-gradient(90deg, #8b5cf6 0%, #a855f7 100%);
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
}
</style>
