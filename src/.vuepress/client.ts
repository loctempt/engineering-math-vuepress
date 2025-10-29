// .vuepress/client.ts
import { defineClientConfig } from "vuepress/client";
import CommentableParagraph from "./components/CommentableParagraph.vue";

export default defineClientConfig({
  enhance: ({ app }) => {
    app.component("CommentableParagraph", CommentableParagraph);
  },
});

