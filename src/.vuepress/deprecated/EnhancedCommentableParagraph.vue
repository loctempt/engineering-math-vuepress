<template>
  <!-- 使用 div 模拟 p 的样式 -->
  <div class="commentable-paragraph-wrapper" :class="{ 'paragraph-wrapper': true }" :id="id">
    <slot />
    <button type="button" @click="isCommentExpanded = !isCommentExpanded"
      :class="'comment-toggle-btn-' + String(isCommentButtonVisible)"
      :title="buttonTitle">
      <div v-if="isCommentExpanded">
        <i-fa6-solid-comment-slash /> {{ commentCount > 0 ? commentCount : "" }}
        <!-- <span v-if="isLoggedIn" class="user-indicator">👤</span> -->
      </div>
      <div v-if="!isCommentExpanded">
        <i-fa6-solid-comment /> {{ commentCount > 0 ? commentCount : "" }}
        <!-- <span v-if="isLoggedIn" class="user-indicator">👤</span> -->
      </div>
    </button>
    <div v-if="isCommentExpanded" class="comment-container">
      <EnhancedParagraphComment :page-id="computedId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useUserStore } from '../stores/user';
import EnhancedParagraphComment from "./EnhancedParagraphComment.vue";
import axios from "axios";

const userStore = useUserStore()
const commentCount = ref(0);
const props = defineProps({
  id: String, // 由 Markdown 插件传入，如 "p-0", "p-1"
});

onMounted(() => {
  axios
    .get(
      `https://waline.fantastic-mathematics.work/api/comment?type=count&url=${computedId}`
    )
    .then((resp) => {
      commentCount.value = resp.data.data[0];
    })
    .catch((err) => {
      console.log(err);
    });
});

const computedId = props.id || "unknown-paragraph";
const isCommentExpanded = ref(false);

// Authentication-aware computed properties
const isLoggedIn = computed(() => userStore.isLoggedIn.value)
const userName = computed(() => userStore.user.display_name|| '')

const isCommentButtonVisible = computed(() => {
  console.log(computedId, isCommentExpanded.value || commentCount.value > 0);
  return isCommentExpanded.value || commentCount.value > 0;
});

const buttonTitle = computed(() => {
  if (isLoggedIn.value) {
    return `评论 (已登录: ${userName.value})`
  }
  return '评论'
})
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

.user-indicator {
  margin-left: 0.2em;
  font-size: 0.8em;
  opacity: 0.7;
}

/* 宽屏（≥1500px）时，启用右侧浮动 */
@media (min-width: 1500px) {
  .commentable-paragraph-wrapper {
    /* 为右侧评论留出空间（通过 padding-right） */
    padding-right: 340px; /* 320px 评论 + 20px 间距 */
  }

  .comment-container {
    position: absolute;
    top: 0;
    left: 100%;
    width: 320px;
    margin-top: 0;
    padding-top: 0;
    border-top: none;
    padding-left: 20px;
    /* 与 VuePress 主题风格一致 */
    font-size: 0.9rem;
    z-index: 170;
  }
}
</style>