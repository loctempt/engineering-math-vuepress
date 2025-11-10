<template>
  <!-- 使用 div 模拟 p 的样式 -->
  <div
    class="commentable-paragraph-wrapper"
    :class="{ 'paragraph-wrapper': true }"
    :id="id"
  >
    <slot />
    <button
      type="button"
      @click="showComment = !showComment"
      :class="'comment-toggle-btn-' + String(showComment)"
    >
      <!-- <VPIcon :icon="showComment ? 'fa6-solid:comment-slash' : 'fa6-solid:comment'" /> -->
      <div v-if="showComment">
        <i-fa6-solid-comment-slash />
      </div>
      <div v-if="!showComment">
        <i-fa6-solid-comment />
      </div>
    </button>
    <div v-if="showComment" class="comment-container">
      <ParagraphComment :page-id="computedId" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import ParagraphComment from "./ParagraphComment.vue";

const props = defineProps({
  id: String, // 由 Markdown 插件传入，如 "p-0", "p-1"
});
const computedId = props.id || "unknown-paragraph";
const showComment = ref(false);
</script>

<style>
.commentable-paragraph-wrapper {
  position: relative;
  /* padding-bottom: 1.5rem; */
}

.comment-toggle-btn-true {
  position: absolute;
  top: 0;
  right: 0;
  display: block;
  padding: 0.2em;
  color: #0756ab;
  background: none;
  border: none;
  cursor: pointer;
}

.comment-toggle-btn-false {
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

.commentable-paragraph-wrapper:hover .comment-toggle-btn-false {
  opacity: 1;
}

.comment-container {
  margin-top: 0.8rem;
  padding-top: 0.8em;
  border-top: 1px dotted var(--vp-c-divider);
}
</style>
