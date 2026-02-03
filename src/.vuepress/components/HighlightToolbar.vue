<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="toolbar-fade">
        <div
          v-if="visible && position"
          class="highlight-toolbar"
          :style="toolbarStyle"
          @mousedown.stop
        >
          <!-- 颜色选择按钮 -->
          <button
            v-for="(config, color) in HIGHLIGHT_COLORS"
            :key="color"
            class="color-btn"
            :style="{ backgroundColor: config.bg, borderColor: config.border }"
            :title="config.name"
            @click="handleColorSelect(color)"
          >
            <span class="color-indicator" :style="{ backgroundColor: config.border }"></span>
          </button>

          <!-- 分隔线 -->
          <span class="divider"></span>

          <!-- 添加笔记按钮 -->
          <button class="action-btn" title="添加笔记" @click="handleAddNote">
            <i-fa6-solid-pen />
          </button>

          <!-- 取消按钮 -->
          <button class="action-btn cancel" title="取消" @click="handleCancel">
            <i-fa6-solid-xmark />
          </button>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { HIGHLIGHT_COLORS, type HighlightColor } from '../stores/highlights'

const props = defineProps<{
  visible: boolean
  position: { x: number; y: number } | null
  selectedText: string
}>()

const emit = defineEmits<{
  (e: 'select-color', color: HighlightColor): void
  (e: 'add-note'): void
  (e: 'cancel'): void
}>()

// 工具栏样式
const toolbarStyle = computed(() => {
  if (!props.position) return {}

  // 工具栏宽度约 200px，居中显示
  const toolbarWidth = 200
  let left = props.position.x - toolbarWidth / 2

  // 确保不超出屏幕边界
  if (left < 10) left = 10
  if (left + toolbarWidth > window.innerWidth - 10) {
    left = window.innerWidth - toolbarWidth - 10
  }

  return {
    left: `${left}px`,
    top: `${props.position.y - 50}px`
  }
})

// 选择颜色
const handleColorSelect = (color: HighlightColor) => {
  emit('select-color', color)
}

// 添加笔记
const handleAddNote = () => {
  emit('add-note')
}

// 取消
const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.highlight-toolbar {
  position: fixed;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  user-select: none;
}

html[data-theme="dark"] .highlight-toolbar {
  background: #2d2d2d;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.color-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s, box-shadow 0.15s;
}

.color-btn:hover {
  transform: scale(1.15);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.divider {
  width: 1px;
  height: 20px;
  background: #e0e0e0;
  margin: 0 4px;
}

html[data-theme="dark"] .divider {
  background: #444;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: #f0f0f0;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}

html[data-theme="dark"] .action-btn {
  background: #3a3a3a;
  color: #aaa;
}

.action-btn:hover {
  background: #e0e0e0;
  color: #333;
}

html[data-theme="dark"] .action-btn:hover {
  background: #4a4a4a;
  color: #fff;
}

.action-btn.cancel:hover {
  background: #fee2e2;
  color: #dc2626;
}

html[data-theme="dark"] .action-btn.cancel:hover {
  background: #451a1a;
  color: #f87171;
}

/* 过渡动画 */
.toolbar-fade-enter-active,
.toolbar-fade-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}

.toolbar-fade-enter-from,
.toolbar-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
