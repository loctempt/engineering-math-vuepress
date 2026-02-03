import { ref, computed } from 'vue'

// 阅读进度接口
export interface ReadingProgress {
    pageId: string           // 页面唯一标识
    progress: number         // 阅读进度 0-100
    lastRead: string         // 最后阅读时间 ISO string
    timeSpent: number        // 阅读时长（秒）
    completed: boolean       // 是否已读完
}

// 阅读进度状态
interface ReadingProgressState {
    progressMap: Map<string, ReadingProgress>
}

// localStorage 存储键
const STORAGE_KEY = 'READING_PROGRESS'

// 响应式状态
const state = ref<ReadingProgressState>({
    progressMap: new Map()
})

// 从 localStorage 加载数据
export const initializeReadingProgress = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            const data = JSON.parse(stored) as Record<string, ReadingProgress>
            state.value.progressMap = new Map(Object.entries(data))
        }
    } catch (error) {
        console.error('[ReadingProgress] 加载阅读进度失败:', error)
    }
}

// 保存数据到 localStorage
const saveToStorage = () => {
    try {
        const data = Object.fromEntries(state.value.progressMap)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
        console.error('[ReadingProgress] 保存阅读进度失败:', error)
    }
}

// 阅读进度 Store
export const useReadingProgressStore = () => {
    // 获取所有进度数据
    const allProgress = computed(() => Array.from(state.value.progressMap.values()))

    // 获取指定页面的进度
    const getProgress = (pageId: string): ReadingProgress | undefined => {
        return state.value.progressMap.get(pageId)
    }

    // 更新页面阅读进度
    const updateProgress = (pageId: string, progress: number) => {
        const existing = state.value.progressMap.get(pageId)
        const now = new Date().toISOString()

        if (existing) {
            // 更新现有记录
            existing.progress = Math.max(existing.progress, progress) // 只增不减
            existing.lastRead = now
            existing.completed = existing.progress >= 95 // 95% 以上视为已读完
        } else {
            // 创建新记录
            state.value.progressMap.set(pageId, {
                pageId,
                progress,
                lastRead: now,
                timeSpent: 0,
                completed: progress >= 95
            })
        }

        saveToStorage()
    }

    // 增加阅读时长
    const addTimeSpent = (pageId: string, seconds: number) => {
        const existing = state.value.progressMap.get(pageId)
        if (existing) {
            existing.timeSpent += seconds
            saveToStorage()
        }
    }

    // 标记页面为已读
    const markAsCompleted = (pageId: string) => {
        updateProgress(pageId, 100)
    }

    // 计算整体完成百分比
    const overallProgress = computed(() => {
        const pages = allProgress.value
        if (pages.length === 0) return 0
        const totalProgress = pages.reduce((sum, p) => sum + p.progress, 0)
        return Math.round(totalProgress / pages.length)
    })

    // 获取已完成的页面数量
    const completedCount = computed(() => {
        return allProgress.value.filter(p => p.completed).length
    })

    // 获取最近阅读的页面
    const recentPages = computed(() => {
        return [...allProgress.value]
            .sort((a, b) => new Date(b.lastRead).getTime() - new Date(a.lastRead).getTime())
            .slice(0, 5)
    })

    // 清除所有进度
    const clearAllProgress = () => {
        state.value.progressMap.clear()
        localStorage.removeItem(STORAGE_KEY)
    }

    return {
        // State
        allProgress,
        overallProgress,
        completedCount,
        recentPages,

        // Actions
        getProgress,
        updateProgress,
        addTimeSpent,
        markAsCompleted,
        clearAllProgress
    }
}

// 导出类型
export type ReadingProgressStore = ReturnType<typeof useReadingProgressStore>
