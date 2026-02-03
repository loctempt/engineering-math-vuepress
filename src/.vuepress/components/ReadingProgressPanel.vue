<template>
  <ClientOnly>
    <NaiveUIConfigProvider>
      <div class="reading-progress-panel">
        <h3 class="panel-title">
          <i-fa6-solid-book-open /> 学习进度
        </h3>

        <!-- 整体进度环形图 -->
        <div class="overall-progress">
          <n-progress
            type="circle"
            :percentage="overallProgress"
            :stroke-width="8"
            :color="progressColor"
          >
            <div class="progress-text">
              <span class="percentage">{{ overallProgress }}%</span>
              <span class="label">完成</span>
            </div>
          </n-progress>
        </div>

        <!-- 统计信息 -->
        <div class="stats">
          <div class="stat-item">
            <span class="stat-value">{{ completedCount }}</span>
            <span class="stat-label">已读完</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ allProgress.length }}</span>
            <span class="stat-label">已访问</span>
          </div>
        </div>

        <!-- 最近阅读 -->
        <div v-if="recentPages.length > 0" class="recent-section">
          <h4 class="section-title">最近阅读</h4>
          <ul class="recent-list">
            <li v-for="page in recentPages" :key="page.pageId" class="recent-item">
              <a :href="page.pageId" class="recent-link">
                <span class="page-name">{{ formatPageName(page.pageId) }}</span>
                <n-progress
                  type="line"
                  :percentage="page.progress"
                  :show-indicator="false"
                  :height="4"
                  :color="page.completed ? '#10b981' : '#3b82f6'"
                />
              </a>
            </li>
          </ul>
        </div>

        <!-- 清除按钮 -->
        <div class="actions">
          <n-button size="small" quaternary @click="handleClear">
            <template #icon>
              <i-fa6-solid-trash />
            </template>
            清除记录
          </n-button>
        </div>
      </div>
    </NaiveUIConfigProvider>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { NProgress, NButton, useMessage } from 'naive-ui'
import NaiveUIConfigProvider from './NaiveUIConfigProvider.vue'
import { useReadingProgressStore, initializeReadingProgress, type ReadingProgress } from '../stores/reading-progress'

const message = useMessage()
let store: ReturnType<typeof useReadingProgressStore>

onMounted(() => {
  initializeReadingProgress()
  store = useReadingProgressStore()
})

// Store 数据
const allProgress = computed(() => store?.allProgress.value || [])
const overallProgress = computed(() => store?.overallProgress.value || 0)
const completedCount = computed(() => store?.completedCount.value || 0)
const recentPages = computed(() => store?.recentPages.value || [])

// 进度颜色
const progressColor = computed(() => {
  const p = overallProgress.value
  if (p >= 80) return '#10b981' // green
  if (p >= 50) return '#3b82f6' // blue
  if (p >= 25) return '#f59e0b' // yellow
  return '#6b7280' // gray
})

// 格式化页面名称
const formatPageName = (pageId: string): string => {
  // 移除开头的斜杠和 .html 后缀
  let name = pageId.replace(/^\//, '').replace(/\.html$/, '').replace(/\/$/, '')
  
  // 如果是空的，返回"首页"
  if (!name) return '首页'
  
  // 取最后一部分作为名称
  const parts = name.split('/')
  return parts[parts.length - 1] || name
}

// 清除记录
const handleClear = () => {
  if (store) {
    store.clearAllProgress()
    message.success('已清除阅读记录')
  }
}
</script>

<style scoped>
.reading-progress-panel {
  padding: 16px;
  background: var(--vp-c-bg-soft, #f5f5f5);
  border-radius: 8px;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text, #333);
}

.overall-progress {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.progress-text {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-text .percentage {
  font-size: 24px;
  font-weight: bold;
  color: var(--vp-c-text, #333);
}

.progress-text .label {
  font-size: 12px;
  color: var(--vp-c-text-2, #666);
}

.stats {
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  border-top: 1px solid var(--vp-c-divider, #eee);
  border-bottom: 1px solid var(--vp-c-divider, #eee);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: var(--vp-c-brand, #3b82f6);
}

.stat-label {
  font-size: 12px;
  color: var(--vp-c-text-2, #666);
}

.recent-section {
  margin-top: 16px;
}

.section-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2, #666);
}

.recent-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recent-item {
  margin-bottom: 8px;
}

.recent-link {
  display: block;
  text-decoration: none;
  color: var(--vp-c-text, #333);
}

.page-name {
  display: block;
  font-size: 13px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-link:hover .page-name {
  color: var(--vp-c-brand, #3b82f6);
}

.actions {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

/* 深色模式 */
html[data-theme="dark"] .reading-progress-panel {
  background: var(--vp-c-bg-soft, #1a1a1a);
}
</style>
