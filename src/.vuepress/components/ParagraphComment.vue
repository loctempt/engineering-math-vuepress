<template>
    <div class="paragraph-comment">
        <ClientOnly>
            <!-- <img src="/maodie.avif"></img> -->
            <!-- <WalineComment :path="pageId"></WalineComment> -->
            <Waline :serverURL="serverURL" :path="pageId" dark='html[data-theme="dark"]'></Waline>
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
// 从主题配置中读取 Giscus 配置（假设你用的是 Giscus）
// import vuepressTheme from '../theme'
import { type ThemeData, useThemeLocaleData } from '@vuepress/plugin-theme-data/client'
import { type WalineOptions } from '@vuepress/plugin-comment'
import { Waline } from '@waline/client/component';
import '@waline/client/style';

const serverURL = 'https://my-waline-repo.vercel.app/'
const props = defineProps({
    pageId: String, // 段落唯一 ID
})

</script>

<style scoped>
.paragraph-comment {
    margin-top: 1rem;
}
</style>

<style>
/* 浅色模式 */
:root {
  /* 让 Waline 的主色 = 主题当前色 */
  --waline-theme-color: #0756ab !important;
  --waline-active-color: #217ddf !important;
}

/* 深色模式（hope 用 html[data-theme="dark"]） */
html[data-theme="dark"] {
  --waline-theme-color: #0756ab !important;
  --waline-active-color: #217ddf !important;
}
</style>