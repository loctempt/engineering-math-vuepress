<template>
  <ClientOnly>
    <NaiveUIConfigProvider>
      <div class="highlight-manager">
        <h3 class="panel-title">
          <i-fa6-solid-highlighter /> 我的标注
        </h3>

        <!-- 当前页面标注数量 -->
        <div class="stats">
          <span class="stat">
            本页 <strong>{{ currentPageHighlights.length }}</strong> 条标注
          </span>
        </div>

        <!-- 标注列表 -->
        <div v-if="currentPageHighlights.length > 0" class="highlight-list">
          <div
            v-for="highlight in currentPageHighlights"
            :key="highlight.id"
            class="highlight-item"
            :style="{ borderLeftColor: HIGHLIGHT_COLORS[highlight.color].border }"
            @click="scrollToHighlight(highlight.id)"
          >
            <div class="highlight-text">
              <span
                class="color-dot"
                :style="{ backgroundColor: HIGHLIGHT_COLORS[highlight.color].border }"
              ></span>
              {{ truncateText(highlight.text, 50) }}
            </div>
            <div v-if="highlight.note" class="highlight-note">
              <i-fa6-solid-pen class="note-icon" />
              {{ truncateText(highlight.note, 30) }}
            </div>
            <div class="highlight-actions">
              <button class="action-btn" title="编辑" @click.stop="handleEdit(highlight)">
                <i-fa6-solid-pen-to-square />
              </button>
              <button class="action-btn delete" title="删除" @click.stop="handleDelete(highlight.id)">
                <i-fa6-solid-trash />
              </button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <i-fa6-solid-highlighter class="empty-icon" />
          <p>选中文本即可添加标注</p>
        </div>

        <!-- 清除按钮 -->
        <div v-if="currentPageHighlights.length > 0" class="actions">
          <n-popconfirm @positive-click="handleClearAll">
            <template #trigger>
              <n-button size="small" quaternary type="error">
                <template #icon><i-fa6-solid-trash /></template>
                清除本页标注
              </n-button>
            </template>
            确定要清除本页所有标注吗？
          </n-popconfirm>
        </div>
      </div>
    </NaiveUIConfigProvider>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vuepress/client'
import { NButton, NPopconfirm, useMessage } from 'naive-ui'
import NaiveUIConfigProvider from './NaiveUIConfigProvider.vue'
import {
  useHighlightsStore,
  initializeHighlights,
  HIGHLIGHT_COLORS,
  type Highlight
} from '../stores/highlights'

const route = useRoute()
const message = useMessage()
let store: ReturnType<typeof useHighlightsStore>

const emit = defineEmits<{
  (e: 'edit', highlight: Highlight): void
}>()

onMounted(() => {
  initializeHighlights()
  store = useHighlightsStore()
})

// 获取当前页面ID
const getPageId = (): string => route.path || 'unknown'

// 当前页面的标注
const currentPageHighlights = computed(() => {
  return store?.getPageHighlights(getPageId()) || []
})

// 截断文本
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// 滚动到高亮位置
const scrollToHighlight = (highlightId: string) => {
  const mark = document.querySelector(`mark[data-highlight-id="${highlightId}"]`)
  if (mark) {
    mark.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // 闪烁效果
    mark.classList.add('highlight-flash')
    setTimeout(() => mark.classList.remove('highlight-flash'), 1000)
  }
}

// 编辑高亮
const handleEdit = (highlight: Highlight) => {
  emit('edit', highlight)
}

// 删除高亮
const handleDelete = (highlightId: string) => {
  // 从 DOM 移除
  const mark = document.querySelector(`mark[data-highlight-id="${highlightId}"]`) as HTMLElement
  if (mark && mark.parentNode) {
    const text = document.createTextNode(mark.textContent || '')
    mark.parentNode.replaceChild(text, mark)
  }
  // 从 store 删除
  store?.deleteHighlight(highlightId)
  message.success('标注已删除')
}

// 清除当前页面所有标注
const handleClearAll = () => {
  const pageId = getPageId()
  // 从 DOM 移除所有标注
  document.querySelectorAll('mark.text-highlight').forEach(mark => {
    if (mark.parentNode) {
      const text = document.createTextNode(mark.textContent || '')
      mark.parentNode.replaceChild(text, mark)
    }
  })
  // 从 store 删除
  store?.clearPageHighlights(pageId)
  message.success('已清除本页所有标注')
}
</script>

<style scoped>
.highlight-manager {
  padding: 16px;
  background: var(--vp-c-bg-soft, #f5f5f5);
  border-radius: 8px;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text, #333);
}

.stats {
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--vp-c-text-2, #666);
}

.highlight-list {
  max-height: 300px;
  overflow-y: auto;
}

.highlight-item {
  padding: 10px;
  margin-bottom: 8px;
  background: #ffffff;
  border-radius: 6px;
  border-left: 3px solid;
  cursor: pointer;
  transition: background 0.15s;
}

html[data-theme="dark"] .highlight-item {
  background: #1a1a1a;
}

.highlight-item:hover {
  background: #f0f0f0;
}

html[data-theme="dark"] .highlight-item:hover {
  background: #2a2a2a;
}

.highlight-text {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: var(--vp-c-text, #333);
  line-height: 1.4;
}

.color-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 4px;
}

.highlight-note {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  padding-left: 16px;
  font-size: 12px;
  color: var(--vp-c-text-2, #666);
}

.note-icon {
  font-size: 10px;
}

.highlight-actions {
  display: flex;
  gap: 4px;
  margin-top: 8px;
  padding-left: 16px;
}

.action-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: #f0f0f0;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  transition: background 0.15s;
}

html[data-theme="dark"] .action-btn {
  background: #2a2a2a;
  color: #aaa;
}

.action-btn:hover {
  background: #e0e0e0;
}

html[data-theme="dark"] .action-btn:hover {
  background: #3a3a3a;
}

.action-btn.delete:hover {
  background: #fee2e2;
  color: #dc2626;
}

html[data-theme="dark"] .action-btn.delete:hover {
  background: #451a1a;
  color: #f87171;
}

.empty-state {
  text-align: center;
  padding: 24px;
  color: var(--vp-c-text-2, #666);
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 13px;
}

.actions {
  margin-top: 12px;
  text-align: center;
}

/* 深色模式 */
html[data-theme="dark"] .highlight-manager {
  background: var(--vp-c-bg-soft, #1a1a1a);
}
</style>

<style>
/* 高亮闪烁效果 - 全局样式 */
@keyframes highlight-flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

mark.highlight-flash {
  animation: highlight-flash 0.3s ease-in-out 3;
}
</style>
