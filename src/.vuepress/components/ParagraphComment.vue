<template>
    <div class="paragraph-comment">
        <ClientOnly>
            <img src="/maodie.avif"></img>
            <Giscus :repo="repo" :repo-id="repoId" :category="category" :category-id="categoryId" :mapping="'specific'"
                :term="pageId" :strict="1" :reactions-enabled="1" :emit-metadata="0" :input-position="'top'"
                :theme="theme" :lang="lang" :loading="lazy" />
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
// 从主题配置中读取 Giscus 配置（假设你用的是 Giscus）
// import vuepressTheme from '../theme'
import { type ThemeData, useThemeLocaleData } from '@vuepress/plugin-theme-data/client'
import { type GiscusOptions } from '@vuepress/plugin-comment'
// import { useThe } from 'vuepress/client'
type MyThemeLocal = ThemeData<{
    plugins: {
        comment: GiscusOptions
    }
}>
const themeLocale = useThemeLocaleData<MyThemeLocal>()


const props = defineProps({
    pageId: String, // 段落唯一 ID
})

// console.log("themeLocale", themeLocale);
// const repo = themeLocale.value.plugins.comment?.repo
// const repoId = themeLocale.value.plugins.comment?.repoId
// const category = themeLocale.value.plugins.comment?.category
// const categoryId = themeLocale.value.plugins.comment?.categoryId
// const theme = 'light'
// const lang = 'zh-CN'
// const lazy = true

</script>

<style scoped>
.paragraph-comment {
    margin-top: 1rem;
}
</style>