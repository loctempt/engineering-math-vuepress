<template>
    <!-- 使用 div 模拟 p 的样式 -->
    <div class="commentable-paragraph-wrapper" :class="{ 'paragraph-wrapper': true }">
        <slot />
        <button @click="showComment = !showComment" class="comment-toggle-btn">
            <VPIcon :icon="showComment ? 'fa6-solid:comment-slash' : 'fa6-solid:comment'" />
        </button>
        <div v-show="showComment" class="comment-container">
            <ParagraphComment :page-id="computedId" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ParagraphComment from './ParagraphComment.vue'

const showComment = ref(false)
const paragraphRef = ref(null)
const paragraphId = ref('')

// 生成唯一 ID：可基于内容哈希或使用索引（这里简化为内容截取）
onMounted(() => {
    const text = paragraphRef.value?.textContent || ''
    // 简单哈希（生产环境建议用更稳定的哈希算法）
    const hash = btoa(encodeURIComponent(text.substring(0, 50))).replace(/[^a-zA-Z0-9]/g, '')
    paragraphId.value = `para-${hash}`
})
</script>

<style>
.commentable-paragraph-wrapper {
    position: relative;
    padding-bottom: 1.5rem;
}

.comment-toggle-btn {
    position: absolute;
    top: 0;
    right: 0;
    display: block;
    padding: 0.2em;
    opacity: 0;
    transition: opacity 0.2s;
    color: #0756ab;
    background: none;
    border: none;
    cursor: pointer;
}

.commentable-paragraph-wrapper:hover .comment-toggle-btn {
    opacity: 1;
}

.comment-container {
    margin-top: 0.8rem;
    padding-top: 0.8em;
    border-top: 1px solid var(--vp-c-divider);
}
</style>