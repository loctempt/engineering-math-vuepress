import { defineUserConfig } from "vuepress";
import paragraphCommentPlugin from './plugins/paragraph-comment.ts'
import testPlugin from "./plugins/test-plugin.ts";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  lang: "zh-CN",
  title: "高等工程数学文档",
  description: "学好高工拿好分数",

  plugins: [
    paragraphCommentPlugin()
    // testPlugin({ 'msg': 'hehe, haha' }),
  ],
  theme,
  // Enable it with pwa
  // shouldPrefetch: false,
});
