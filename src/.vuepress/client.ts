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
  },
});

