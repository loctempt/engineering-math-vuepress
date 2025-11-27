import { watchEffect, ref } from 'vue'
// import { darkTheme } from 'naive-ui'
import naive_ui from 'naive-ui'

const { darkTheme } = naive_ui;
export const naiveThemeRef = ref<any>(null)

export function setupNaiveReactiveTheme() {
  const html = document.documentElement

  const updateTheme = () => {
    const isDark = html.getAttribute('data-theme') === 'dark'
    naiveThemeRef.value = isDark ? darkTheme : null
  }

  // Initial update
  updateTheme()

  // React to changes (use MutationObserver for reliability)
  const observer = new MutationObserver(() => {
    updateTheme()
  })
  observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] })

  // Cleanup (optional)
  return () => observer.disconnect()
}