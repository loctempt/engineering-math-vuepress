<template>
  <ClientOnly>
    <!-- 阅读进度条 -->
    <ReadingProgressBar />

    <!-- 高亮工具栏 -->
    <HighlightToolbar
      :visible="showToolbar"
      :position="toolbarPosition"
      :selected-text="selectedText"
      @select-color="handleSelectColor"
      @add-note="handleAddNote"
      @cancel="handleCancelSelection"
    />

    <!-- 高亮笔记弹窗 -->
    <HighlightNote
      :visible="showNoteModal"
      :text="selectedText"
      :highlight="editingHighlight"
      @close="handleCloseNote"
      @save="handleSaveNote"
      @delete="handleDeleteHighlight"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { useRoute } from 'vuepress/client'
import ReadingProgressBar from './ReadingProgressBar.vue'
import HighlightToolbar from './HighlightToolbar.vue'
import HighlightNote from './HighlightNote.vue'
import {
  useHighlightsStore,
  initializeHighlights,
  HIGHLIGHT_COLORS,
  type HighlightColor,
  type Highlight
} from '../stores/highlights'

const route = useRoute()
let store: ReturnType<typeof useHighlightsStore>

// 工具栏状态
const showToolbar = ref(false)
const toolbarPosition = ref<{ x: number; y: number } | null>(null)
const selectedText = ref('')
const selectedRange = ref<Range | null>(null)

// 笔记弹窗状态
const showNoteModal = ref(false)
const editingHighlight = ref<Highlight | null>(null)
const pendingColor = ref<HighlightColor>('yellow')

// 获取当前页面ID
const getPageId = (): string => route.path || 'unknown'

// 获取元素路径
const getElementPath = (element: Node): string => {
  if (element.nodeType === Node.TEXT_NODE) {
    const parent = element.parentElement
    if (!parent) return ''
    const parentPath = getElementPath(parent)
    const textNodes = Array.from(parent.childNodes).filter(n => n.nodeType === Node.TEXT_NODE)
    const textIndex = textNodes.indexOf(element as Text)
    return `${parentPath}::text(${textIndex})`
  }
  if (element.nodeType !== Node.ELEMENT_NODE) return ''
  const el = element as Element
  if (el.id) return `#${el.id}`
  const parent = el.parentElement
  if (!parent) return el.tagName.toLowerCase()
  const siblings = Array.from(parent.children).filter(c => c.tagName === el.tagName)
  const index = siblings.indexOf(el)
  const selector = siblings.length > 1
    ? `${el.tagName.toLowerCase()}:nth-of-type(${index + 1})`
    : el.tagName.toLowerCase()
  const parentPath = getElementPath(parent)
  return parentPath ? `${parentPath} > ${selector}` : selector
}

// 根据路径查找元素
const findElementByPath = (path: string): Node | null => {
  if (!path) return null
  const textMatch = path.match(/^(.+)::text\((\d+)\)$/)
  if (textMatch) {
    const [, parentPath, indexStr] = textMatch
    const parent = document.querySelector(parentPath)
    if (!parent) return null
    const textNodes = Array.from(parent.childNodes).filter(n => n.nodeType === Node.TEXT_NODE)
    return textNodes[parseInt(indexStr, 10)] || null
  }
  return document.querySelector(path)
}

// 序列化 Range
const serializeRange = (range: Range) => ({
  startContainerPath: getElementPath(range.startContainer),
  startOffset: range.startOffset,
  endContainerPath: getElementPath(range.endContainer),
  endOffset: range.endOffset
})

// 反序列化 Range
const deserializeRange = (rangeInfo: Highlight['rangeInfo']): Range | null => {
  try {
    const startContainer = findElementByPath(rangeInfo.startContainerPath)
    const endContainer = findElementByPath(rangeInfo.endContainerPath)
    if (!startContainer || !endContainer) return null
    const range = document.createRange()
    range.setStart(startContainer, rangeInfo.startOffset)
    range.setEnd(endContainer, rangeInfo.endOffset)
    return range
  } catch {
    return null
  }
}

// 应用高亮到 DOM
const applyHighlightToDOM = (highlight: Highlight): HTMLElement | null => {
  const range = deserializeRange(highlight.rangeInfo)
  if (!range) return null
  try {
    const mark = document.createElement('mark')
    mark.className = `text-highlight highlight-${highlight.color}`
    mark.dataset.highlightId = highlight.id
    mark.style.backgroundColor = HIGHLIGHT_COLORS[highlight.color].bg
    mark.style.borderBottom = `2px solid ${HIGHLIGHT_COLORS[highlight.color].border}`
    mark.style.cursor = 'pointer'
    range.surroundContents(mark)
    mark.addEventListener('click', (e) => {
      e.stopPropagation()
      editingHighlight.value = highlight
      showNoteModal.value = true
    })
    return mark
  } catch {
    return null
  }
}

// 恢复页面高亮
const restoreHighlights = () => {
  const pageId = getPageId()
  const highlights = store?.getPageHighlights(pageId) || []
  highlights.forEach(applyHighlightToDOM)
}

// 处理文本选择
const handleSelectionChange = () => {
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || !sel.toString().trim()) {
    showToolbar.value = false
    return
  }
  const range = sel.getRangeAt(0)
  const rect = range.getBoundingClientRect()
  const container = range.commonAncestorContainer
  const contentElement = document.querySelector('.vp-page') || document.querySelector('.theme-default-content')
  if (!contentElement?.contains(container)) {
    showToolbar.value = false
    return
  }
  selectedText.value = sel.toString().trim()
  selectedRange.value = range.cloneRange()
  toolbarPosition.value = {
    x: rect.left + rect.width / 2,
    y: rect.top + window.scrollY
  }
  showToolbar.value = true
}

// 选择颜色直接创建高亮
const handleSelectColor = (color: HighlightColor) => {
  if (!selectedRange.value || !selectedText.value) return
  const rangeInfo = serializeRange(selectedRange.value)
  const highlight = store?.addHighlight(getPageId(), selectedText.value, color, rangeInfo, '')
  if (highlight) applyHighlightToDOM(highlight)
  window.getSelection()?.removeAllRanges()
  showToolbar.value = false
  selectedRange.value = null
}

// 添加笔记
const handleAddNote = () => {
  pendingColor.value = 'yellow'
  editingHighlight.value = null
  showNoteModal.value = true
  showToolbar.value = false
}

// 取消选择
const handleCancelSelection = () => {
  window.getSelection()?.removeAllRanges()
  showToolbar.value = false
  selectedRange.value = null
}

// 关闭笔记弹窗
const handleCloseNote = () => {
  showNoteModal.value = false
  editingHighlight.value = null
  if (!editingHighlight.value) {
    window.getSelection()?.removeAllRanges()
    selectedRange.value = null
  }
}

// 保存笔记
const handleSaveNote = (data: { color: HighlightColor; note: string }) => {
  if (editingHighlight.value) {
    // 编辑模式
    store?.updateHighlight(editingHighlight.value.id, data)
    const mark = document.querySelector(`mark[data-highlight-id="${editingHighlight.value.id}"]`) as HTMLElement
    if (mark) {
      mark.className = `text-highlight highlight-${data.color}`
      mark.style.backgroundColor = HIGHLIGHT_COLORS[data.color].bg
      mark.style.borderBottom = `2px solid ${HIGHLIGHT_COLORS[data.color].border}`
    }
  } else if (selectedRange.value && selectedText.value) {
    // 创建新高亮
    const rangeInfo = serializeRange(selectedRange.value)
    const highlight = store?.addHighlight(getPageId(), selectedText.value, data.color, rangeInfo, data.note)
    if (highlight) applyHighlightToDOM(highlight)
  }
  showNoteModal.value = false
  editingHighlight.value = null
  window.getSelection()?.removeAllRanges()
  selectedRange.value = null
}

// 删除高亮
const handleDeleteHighlight = () => {
  if (editingHighlight.value) {
    const mark = document.querySelector(`mark[data-highlight-id="${editingHighlight.value.id}"]`) as HTMLElement
    if (mark && mark.parentNode) {
      const text = document.createTextNode(mark.textContent || '')
      mark.parentNode.replaceChild(text, mark)
    }
    store?.deleteHighlight(editingHighlight.value.id)
  }
  showNoteModal.value = false
  editingHighlight.value = null
}

// 初始化
onMounted(() => {
  initializeHighlights()
  store = useHighlightsStore()
  nextTick(() => setTimeout(restoreHighlights, 100))
  document.addEventListener('mouseup', handleSelectionChange)
})

// 清理
onUnmounted(() => {
  document.removeEventListener('mouseup', handleSelectionChange)
})

// 路由变化时重新恢复高亮
watch(() => route.path, () => {
  showToolbar.value = false
  showNoteModal.value = false
  editingHighlight.value = null
  nextTick(() => setTimeout(restoreHighlights, 100))
})
</script>
