import { ref, computed } from 'vue'

// 高亮标注接口
export interface Highlight {
    id: string                 // 唯一ID
    pageId: string             // 页面标识
    text: string               // 高亮的文本内容
    color: HighlightColor      // 高亮颜色
    note: string               // 用户笔记
    // Range 序列化数据
    rangeInfo: {
        startContainerPath: string   // 起始节点的 CSS 选择器路径
        startOffset: number          // 起始偏移
        endContainerPath: string     // 结束节点的 CSS 选择器路径
        endOffset: number            // 结束偏移
    }
    createdAt: string          // 创建时间
    updatedAt: string          // 更新时间
}

// 高亮颜色选项
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple'

// 高亮颜色配置
export const HIGHLIGHT_COLORS: Record<HighlightColor, { bg: string; border: string; name: string }> = {
    yellow: { bg: 'rgba(255, 235, 59, 0.4)', border: '#fdd835', name: '黄色' },
    green: { bg: 'rgba(76, 175, 80, 0.3)', border: '#43a047', name: '绿色' },
    blue: { bg: 'rgba(33, 150, 243, 0.3)', border: '#1e88e5', name: '蓝色' },
    pink: { bg: 'rgba(233, 30, 99, 0.25)', border: '#d81b60', name: '粉色' },
    purple: { bg: 'rgba(156, 39, 176, 0.25)', border: '#8e24aa', name: '紫色' }
}

// 状态接口
interface HighlightsState {
    highlights: Map<string, Highlight[]>  // pageId -> Highlight[]
}

// localStorage 存储键
const STORAGE_KEY = 'TEXT_HIGHLIGHTS'

// 响应式状态
const state = ref<HighlightsState>({
    highlights: new Map()
})

// 生成唯一ID
const generateId = (): string => {
    return `hl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 从 localStorage 加载数据
export const initializeHighlights = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            const data = JSON.parse(stored) as Record<string, Highlight[]>
            state.value.highlights = new Map(Object.entries(data))
        }
    } catch (error) {
        console.error('[Highlights] 加载高亮数据失败:', error)
    }
}

// 保存数据到 localStorage
const saveToStorage = () => {
    try {
        const data = Object.fromEntries(state.value.highlights)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
        console.error('[Highlights] 保存高亮数据失败:', error)
    }
}

// 高亮标注 Store
export const useHighlightsStore = () => {
    // 获取指定页面的所有高亮
    const getPageHighlights = (pageId: string): Highlight[] => {
        return state.value.highlights.get(pageId) || []
    }

    // 获取所有高亮
    const allHighlights = computed(() => {
        const all: Highlight[] = []
        state.value.highlights.forEach(highlights => all.push(...highlights))
        return all
    })

    // 获取指定页面的高亮数量
    const getHighlightCount = (pageId: string): number => {
        return getPageHighlights(pageId).length
    }

    // 添加新高亮
    const addHighlight = (
        pageId: string,
        text: string,
        color: HighlightColor,
        rangeInfo: Highlight['rangeInfo'],
        note: string = ''
    ): Highlight => {
        const now = new Date().toISOString()
        const highlight: Highlight = {
            id: generateId(),
            pageId,
            text,
            color,
            note,
            rangeInfo,
            createdAt: now,
            updatedAt: now
        }

        const pageHighlights = state.value.highlights.get(pageId) || []
        pageHighlights.push(highlight)
        state.value.highlights.set(pageId, pageHighlights)

        saveToStorage()
        return highlight
    }

    // 更新高亮
    const updateHighlight = (id: string, updates: Partial<Pick<Highlight, 'color' | 'note'>>) => {
        for (const [pageId, highlights] of state.value.highlights) {
            const index = highlights.findIndex(h => h.id === id)
            if (index !== -1) {
                highlights[index] = {
                    ...highlights[index],
                    ...updates,
                    updatedAt: new Date().toISOString()
                }
                state.value.highlights.set(pageId, highlights)
                saveToStorage()
                return true
            }
        }
        return false
    }

    // 删除高亮
    const deleteHighlight = (id: string): boolean => {
        for (const [pageId, highlights] of state.value.highlights) {
            const index = highlights.findIndex(h => h.id === id)
            if (index !== -1) {
                highlights.splice(index, 1)
                if (highlights.length === 0) {
                    state.value.highlights.delete(pageId)
                } else {
                    state.value.highlights.set(pageId, highlights)
                }
                saveToStorage()
                return true
            }
        }
        return false
    }

    // 删除页面的所有高亮
    const clearPageHighlights = (pageId: string) => {
        state.value.highlights.delete(pageId)
        saveToStorage()
    }

    // 清除所有高亮
    const clearAllHighlights = () => {
        state.value.highlights.clear()
        localStorage.removeItem(STORAGE_KEY)
    }

    // 根据ID获取高亮
    const getHighlightById = (id: string): Highlight | undefined => {
        for (const highlights of state.value.highlights.values()) {
            const found = highlights.find(h => h.id === id)
            if (found) return found
        }
        return undefined
    }

    return {
        // State
        allHighlights,

        // Getters
        getPageHighlights,
        getHighlightCount,
        getHighlightById,

        // Actions
        addHighlight,
        updateHighlight,
        deleteHighlight,
        clearPageHighlights,
        clearAllHighlights
    }
}

// 导出类型
export type HighlightsStore = ReturnType<typeof useHighlightsStore>
