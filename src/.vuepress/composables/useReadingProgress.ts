import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vuepress/client'
import { useReadingProgressStore, initializeReadingProgress } from '../stores/reading-progress'

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

/**
 * 页面阅读进度追踪 composable
 * 监听页面滚动，计算并保存阅读进度
 */
export const useReadingProgress = () => {
    const route = useRoute()
    const store = useReadingProgressStore()

    // 当前页面进度
    const currentProgress = ref(0)

    // 计时器相关
    let timeTracker: ReturnType<typeof setInterval> | null = null
    let elapsedSeconds = 0

    // 计算当前页面ID
    const getPageId = (): string => {
        return route.path || 'unknown'
    }

    // 计算滚动进度
    const calculateProgress = (): number => {
        if (typeof window === 'undefined') return 0

        const scrollTop = window.scrollY || document.documentElement.scrollTop
        const scrollHeight = document.documentElement.scrollHeight
        const clientHeight = document.documentElement.clientHeight

        // 如果页面不需要滚动，直接返回100%
        if (scrollHeight <= clientHeight) {
            return 100
        }

        const maxScroll = scrollHeight - clientHeight
        const progress = Math.min(100, Math.round((scrollTop / maxScroll) * 100))

        return progress
    }

    // 处理滚动事件
    const handleScroll = throttle(() => {
        const progress = calculateProgress()
        currentProgress.value = progress

        // 保存进度到 store
        const pageId = getPageId()
        if (pageId !== 'unknown') {
            store.updateProgress(pageId, progress)
        }
    }, 200) // 200ms 节流

    // 开始时间追踪
    const startTimeTracking = () => {
        elapsedSeconds = 0
        timeTracker = setInterval(() => {
            elapsedSeconds++
            // 每30秒保存一次阅读时长
            if (elapsedSeconds % 30 === 0) {
                const pageId = getPageId()
                if (pageId !== 'unknown') {
                    store.addTimeSpent(pageId, 30)
                }
            }
        }, 1000)
    }

    // 停止时间追踪
    const stopTimeTracking = () => {
        if (timeTracker) {
            clearInterval(timeTracker)
            timeTracker = null

            // 保存剩余时间
            const remainingSeconds = elapsedSeconds % 30
            if (remainingSeconds > 0) {
                const pageId = getPageId()
                if (pageId !== 'unknown') {
                    store.addTimeSpent(pageId, remainingSeconds)
                }
            }
        }
    }

    // 获取当前页面已保存的进度
    const getSavedProgress = (): number => {
        const pageId = getPageId()
        const progress = store.getProgress(pageId)
        return progress?.progress || 0
    }

    // 初始化
    onMounted(() => {
        // 初始化 store
        initializeReadingProgress()

        // 获取已保存的进度
        currentProgress.value = Math.max(calculateProgress(), getSavedProgress())

        // 监听滚动
        window.addEventListener('scroll', handleScroll, { passive: true })

        // 开始时间追踪
        startTimeTracking()
    })

    // 清理
    onUnmounted(() => {
        window.removeEventListener('scroll', handleScroll)
        stopTimeTracking()
    })

    // 路由变化时重置
    watch(
        () => route.path,
        () => {
            // 保存当前页面时间
            stopTimeTracking()

            // 重新计算新页面进度
            currentProgress.value = Math.max(calculateProgress(), getSavedProgress())

            // 开始新页面的时间追踪
            startTimeTracking()
        }
    )

    return {
        // 当前页面阅读进度
        currentProgress,

        // Store 中的数据
        allProgress: store.allProgress,
        overallProgress: store.overallProgress,
        completedCount: store.completedCount,
        recentPages: store.recentPages,

        // 手动刷新进度
        refreshProgress: () => {
            currentProgress.value = calculateProgress()
        }
    }
}
