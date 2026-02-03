import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vuepress/client'
import {
    useHighlightsStore,
    initializeHighlights,
    type Highlight,
    type HighlightColor,
    HIGHLIGHT_COLORS
} from '../stores/highlights'

// 获取元素的唯一路径选择器
const getElementPath = (element: Node): string => {
    if (element.nodeType === Node.TEXT_NODE) {
        const parent = element.parentElement
        if (!parent) return ''

        // 获取父元素路径 + 文本节点索引
        const parentPath = getElementPath(parent)
        const textNodes = Array.from(parent.childNodes).filter(n => n.nodeType === Node.TEXT_NODE)
        const textIndex = textNodes.indexOf(element as Text)

        return `${parentPath}::text(${textIndex})`
    }

    if (element.nodeType !== Node.ELEMENT_NODE) return ''

    const el = element as Element

    // 如果有ID，直接使用
    if (el.id) {
        return `#${el.id}`
    }

    // 构建路径
    const parent = el.parentElement
    if (!parent) {
        return el.tagName.toLowerCase()
    }

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

    // 检查是否是文本节点路径
    const textMatch = path.match(/^(.+)::text\((\d+)\)$/)
    if (textMatch) {
        const [, parentPath, indexStr] = textMatch
        const parent = document.querySelector(parentPath)
        if (!parent) return null

        const textNodes = Array.from(parent.childNodes).filter(n => n.nodeType === Node.TEXT_NODE)
        const index = parseInt(indexStr, 10)
        return textNodes[index] || null
    }

    // 普通元素
    return document.querySelector(path)
}

/**
 * 文本高亮标注 composable
 */
export const useTextHighlight = () => {
    const route = useRoute()
    const store = useHighlightsStore()

    // 当前选中的文本信息
    const selection = ref<{
        text: string
        range: Range
        position: { x: number; y: number }
    } | null>(null)

    // 是否显示工具栏
    const showToolbar = ref(false)

    // 当前编辑的高亮
    const editingHighlight = ref<Highlight | null>(null)

    // 获取当前页面ID
    const getPageId = (): string => {
        return route.path || 'unknown'
    }

    // 序列化 Range
    const serializeRange = (range: Range): Highlight['rangeInfo'] => {
        return {
            startContainerPath: getElementPath(range.startContainer),
            startOffset: range.startOffset,
            endContainerPath: getElementPath(range.endContainer),
            endOffset: range.endOffset
        }
    }

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
        } catch (error) {
            console.error('[TextHighlight] 反序列化 Range 失败:', error)
            return null
        }
    }

    // 应用高亮样式到 DOM
    const applyHighlightToDOM = (highlight: Highlight): HTMLElement | null => {
        const range = deserializeRange(highlight.rangeInfo)
        if (!range) return null

        try {
            // 创建高亮包装元素
            const mark = document.createElement('mark')
            mark.className = `text-highlight highlight-${highlight.color}`
            mark.dataset.highlightId = highlight.id
            mark.style.backgroundColor = HIGHLIGHT_COLORS[highlight.color].bg
            mark.style.borderBottom = `2px solid ${HIGHLIGHT_COLORS[highlight.color].border}`
            mark.style.cursor = 'pointer'

            // 包裹选中内容
            range.surroundContents(mark)

            // 添加点击事件
            mark.addEventListener('click', (e) => {
                e.stopPropagation()
                editingHighlight.value = highlight
            })

            return mark
        } catch (error) {
            // 如果 range 跨越多个节点，surroundContents 会失败
            console.warn('[TextHighlight] 应用高亮失败，可能跨越多个节点:', error)
            return null
        }
    }

    // 从 DOM 移除高亮
    const removeHighlightFromDOM = (highlightId: string) => {
        const mark = document.querySelector(`mark[data-highlight-id="${highlightId}"]`) as HTMLElement
        if (mark && mark.parentNode) {
            // 用文本内容替换 mark 元素
            const text = document.createTextNode(mark.textContent || '')
            mark.parentNode.replaceChild(text, mark)
        }
    }

    // 恢复页面上的所有高亮
    const restoreHighlights = () => {
        const pageId = getPageId()
        const highlights = store.getPageHighlights(pageId)

        highlights.forEach(highlight => {
            applyHighlightToDOM(highlight)
        })
    }

    // 处理文本选择
    const handleSelectionChange = () => {
        const sel = window.getSelection()

        if (!sel || sel.isCollapsed || !sel.toString().trim()) {
            // 没有选中文本
            selection.value = null
            showToolbar.value = false
            return
        }

        const range = sel.getRangeAt(0)
        const rect = range.getBoundingClientRect()

        // 检查选择是否在文档内容区域
        const container = range.commonAncestorContainer
        const contentElement = document.querySelector('.vp-page') || document.querySelector('.theme-default-content')

        if (!contentElement?.contains(container)) {
            selection.value = null
            showToolbar.value = false
            return
        }

        selection.value = {
            text: sel.toString().trim(),
            range: range.cloneRange(),
            position: {
                x: rect.left + rect.width / 2,
                y: rect.top - 10
            }
        }
        showToolbar.value = true
    }

    // 创建高亮
    const createHighlight = (color: HighlightColor, note: string = '') => {
        if (!selection.value) return null

        const pageId = getPageId()
        const rangeInfo = serializeRange(selection.value.range)

        // 保存到 store
        const highlight = store.addHighlight(
            pageId,
            selection.value.text,
            color,
            rangeInfo,
            note
        )

        // 应用到 DOM
        applyHighlightToDOM(highlight)

        // 清除选择
        window.getSelection()?.removeAllRanges()
        selection.value = null
        showToolbar.value = false

        return highlight
    }

    // 删除高亮
    const deleteHighlight = (highlightId: string) => {
        removeHighlightFromDOM(highlightId)
        store.deleteHighlight(highlightId)
        editingHighlight.value = null
    }

    // 更新高亮
    const updateHighlight = (highlightId: string, updates: { color?: HighlightColor; note?: string }) => {
        store.updateHighlight(highlightId, updates)

        // 更新 DOM 样式
        if (updates.color) {
            const mark = document.querySelector(`mark[data-highlight-id="${highlightId}"]`) as HTMLElement
            if (mark) {
                mark.className = `text-highlight highlight-${updates.color}`
                mark.style.backgroundColor = HIGHLIGHT_COLORS[updates.color].bg
                mark.style.borderBottom = `2px solid ${HIGHLIGHT_COLORS[updates.color].border}`
            }
        }
    }

    // 取消选择
    const cancelSelection = () => {
        window.getSelection()?.removeAllRanges()
        selection.value = null
        showToolbar.value = false
    }

    // 关闭编辑面板
    const closeEditPanel = () => {
        editingHighlight.value = null
    }

    // 初始化
    onMounted(() => {
        initializeHighlights()

        // 等待 DOM 渲染完成后恢复高亮
        nextTick(() => {
            setTimeout(restoreHighlights, 100)
        })

        // 监听文本选择
        document.addEventListener('mouseup', handleSelectionChange)
    })

    // 清理
    onUnmounted(() => {
        document.removeEventListener('mouseup', handleSelectionChange)
    })

    // 路由变化时重新恢复高亮
    watch(
        () => route.path,
        () => {
            selection.value = null
            showToolbar.value = false
            editingHighlight.value = null

            // 恢复新页面的高亮
            nextTick(() => {
                setTimeout(restoreHighlights, 100)
            })
        }
    )

    return {
        // 状态
        selection,
        showToolbar,
        editingHighlight,

        // 当前页面的高亮
        currentPageHighlights: () => store.getPageHighlights(getPageId()),

        // 操作
        createHighlight,
        deleteHighlight,
        updateHighlight,
        cancelSelection,
        closeEditPanel,
        restoreHighlights,

        // 颜色配置
        HIGHLIGHT_COLORS
    }
}
