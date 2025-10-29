<template>
    <div class="paragraph-comment">
        <ClientOnly>
            <div v-if="showWaline" ref="walineRef" :pageId="pageId"></div>
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
import '@waline/client/style';
import { onBeforeUnmount, ref, nextTick } from 'vue';
import { init } from '@waline/client';

const serverURL = 'https://waline.fantastic-mathematics.work/'
const props = defineProps({
    pageId: String, // 段落唯一 ID
})
const showWaline = ref(true);
const walineRef = ref<HTMLDivElement>();
let walineInstance: ReturnType<typeof init> | null = null

/* 3. 挂载后初始化 */
nextTick(() => {
    if (!walineRef.value) return
    walineInstance = init({
        el: walineRef.value,
        serverURL: serverURL,
        path: props.pageId,
        dark: 'html[data-theme="dark"]'
        // …其他配置
    })
})

/* 4. 组件销毁前：先判空再 destroy，防止 removeChild 报错 */
/* 路由切换 = 组件卸载 */
onBeforeUnmount(() => {
    // ② 先让 Waline 与 DOM 脱钩
    if (walineInstance) {
        walineInstance = null
    }
    // ③ 再让 Vue 把容器干掉（此时不再执行任何 removeChild）
    showWaline.value = false
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