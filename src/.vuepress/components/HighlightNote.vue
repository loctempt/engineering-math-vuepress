<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="visible" class="highlight-note-overlay" @click="handleClose">
          <div class="highlight-note-modal" @click.stop>
            <div class="modal-header">
              <h3>{{ isEditing ? '编辑标注' : '添加笔记' }}</h3>
              <button class="close-btn" @click="handleClose">
                <i-fa6-solid-xmark />
              </button>
            </div>

            <!-- 高亮文本预览 -->
            <div class="highlighted-text">
              <span
                class="text-preview"
                :style="{ backgroundColor: HIGHLIGHT_COLORS[currentColor].bg }"
              >
                {{ truncatedText }}
              </span>
            </div>

            <!-- 颜色选择 -->
            <div class="color-selector">
              <span class="label">颜色：</span>
              <div class="color-options">
                <button
                  v-for="(config, color) in HIGHLIGHT_COLORS"
                  :key="color"
                  class="color-option"
                  :class="{ active: currentColor === color }"
                  :style="{ backgroundColor: config.bg, borderColor: config.border }"
                  @click="currentColor = color"
                >
                  <i-fa6-solid-check v-if="currentColor === color" />
                </button>
              </div>
            </div>

            <!-- 笔记输入 -->
            <div class="note-input">
              <label class="label">笔记：</label>
              <NaiveUIConfigProvider>
                <n-input
                  v-model:value="noteContent"
                  type="textarea"
                  placeholder="添加你的笔记..."
                  :rows="3"
                  :maxlength="500"
                  show-count
                />
              </NaiveUIConfigProvider>
            </div>

            <!-- 操作按钮 -->
            <div class="modal-actions">
              <NaiveUIConfigProvider>
                <n-button v-if="isEditing" type="error" ghost @click="handleDelete">
                  <template #icon><i-fa6-solid-trash /></template>
                  删除
                </n-button>
                <div class="spacer"></div>
                <n-button @click="handleClose">取消</n-button>
                <n-button type="primary" @click="handleSave">
                  {{ isEditing ? '保存' : '创建' }}
                </n-button>
              </NaiveUIConfigProvider>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { NInput, NButton } from 'naive-ui'
import NaiveUIConfigProvider from './NaiveUIConfigProvider.vue'
import { HIGHLIGHT_COLORS, type HighlightColor, type Highlight } from '../stores/highlights'

const props = defineProps<{
  visible: boolean
  text: string
  highlight?: Highlight | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: { color: HighlightColor; note: string }): void
  (e: 'delete'): void
}>()

// 是否是编辑模式
const isEditing = computed(() => !!props.highlight)

// 当前颜色
const currentColor = ref<HighlightColor>('yellow')

// 笔记内容
const noteContent = ref('')

// 截断的文本预览
const truncatedText = computed(() => {
  const text = props.highlight?.text || props.text
  if (text.length > 100) {
    return text.slice(0, 100) + '...'
  }
  return text
})

// 监听打开时初始化数据
watch(() => props.visible, (visible) => {
  if (visible) {
    if (props.highlight) {
      currentColor.value = props.highlight.color
      noteContent.value = props.highlight.note
    } else {
      currentColor.value = 'yellow'
      noteContent.value = ''
    }
  }
})

// 关闭
const handleClose = () => {
  emit('close')
}

// 保存
const handleSave = () => {
  emit('save', {
    color: currentColor.value,
    note: noteContent.value.trim()
  })
}

// 删除
const handleDelete = () => {
  emit('delete')
}
</script>

<style scoped>
.highlight-note-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
}

.highlight-note-modal {
  width: 90%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

html[data-theme="dark"] .highlight-note-modal {
  background: #2d2d2d;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--vp-c-text, #333);
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.close-btn:hover {
  background: #f0f0f0;
  color: #333;
}

html[data-theme="dark"] .close-btn:hover {
  background: #3a3a3a;
  color: #fff;
}

.highlighted-text {
  margin-bottom: 16px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
}

html[data-theme="dark"] .highlighted-text {
  background: #1a1a1a;
}

.text-preview {
  display: block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--vp-c-text, #333);
}

.color-selector {
  margin-bottom: 16px;
}

.label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2, #666);
  margin-bottom: 8px;
}

.color-options {
  display: flex;
  gap: 8px;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  font-size: 12px;
  transition: transform 0.15s;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.note-input {
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.spacer {
  flex: 1;
}

/* 过渡动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s;
}

.modal-fade-enter-active .highlight-note-modal,
.modal-fade-leave-active .highlight-note-modal {
  transition: transform 0.2s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .highlight-note-modal,
.modal-fade-leave-to .highlight-note-modal {
  transform: scale(0.95);
}
</style>
