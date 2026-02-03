// .vuepress/client.ts
import { defineClientConfig } from "vuepress/client";
import CommentableParagraph from "./components/CommentableParagraph.vue";
// import EnhancedCommentableParagraph from "./deprecated/EnhancedCommentableParagraph.vue";
// import EnhancedParagraphComment from "./deprecated/EnhancedParagraphComment.vue";
import LoginModal from "./deprecated/LoginModal.vue";
import AuthTest from "./deprecated/AuthTest.vue";
import AuthView from './components/AuthView.vue';
import NaiveUIProvider from "./components/NaiveUIConfigProvider.vue";
import naive from 'naive-ui'

// 新功能组件
import FeatureContainer from "./components/FeatureContainer.vue";
import ReadingProgressBar from "./components/ReadingProgressBar.vue";
import ReadingProgressPanel from "./components/ReadingProgressPanel.vue";
import HighlightToolbar from "./components/HighlightToolbar.vue";
import HighlightNote from "./components/HighlightNote.vue";
import HighlightManager from "./components/HighlightManager.vue";

export default defineClientConfig({
  enhance: ({ app }) => {
    app.use(naive)

    app.component("CommentableParagraph", CommentableParagraph);
    // app.component("EnhancedCommentableParagraph", EnhancedCommentableParagraph);
    // app.component("EnhancedParagraphComment", EnhancedParagraphComment);
    app.component("LoginModal", LoginModal);
    app.component("AuthTest", AuthTest);
    app.component("AuthView", AuthView);
    app.component('NaiveUIProvider', NaiveUIProvider)

    // 注册新功能组件
    app.component("ReadingProgressBar", ReadingProgressBar);
    app.component("ReadingProgressPanel", ReadingProgressPanel);
    app.component("HighlightToolbar", HighlightToolbar);
    app.component("HighlightNote", HighlightNote);
    app.component("HighlightManager", HighlightManager);
  },

  // 添加全局组件 - 阅读进度条和高亮功能
  rootComponents: [FeatureContainer],
});
