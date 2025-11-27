<template>
    <ClientOnly>
        <n-config-provider :theme="naiveTheme">
            <slot />
        </n-config-provider>
    </ClientOnly>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { darkTheme } from 'naive-ui'
// import { useDarkMode} from 'vuepress-theme-hope/client'
import { NConfigProvider } from 'naive-ui';
import { naiveThemeRef } from '../composables/useNaiveReactiveTheme'

// Get dark mode status from vuepress-theme-hope
// const { isDarkMode } = useDarkMode()

// Compute naive-ui theme based on dark mode
// const naiveTheme = computed(() => isDarkMode.value ? darkTheme : null)
const naiveTheme = naiveThemeRef;


// Compute theme overrides based on current mode
// const themeOverrides = computed(() =>
//     isDarkMode.value ? darkThemeOverrides : lightThemeOverrides
// )
</script>