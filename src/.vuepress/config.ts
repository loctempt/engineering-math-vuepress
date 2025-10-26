import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  lang: "zh-CN",
  title: "Docs Demo",
  description: "A docs demo for vuepress-theme-hope",

  theme,
  head: [
    [
      'script',
      {},
      `
        window.MathJax = {
          loader: {
            load: ['menu']  // ←←← 启用右键菜单的核心！
          },
          startup: {
            ready() {
              // 等待 MathJax 加载完成后再初始化菜单
              MathJax.startup.defaultReady();
            }
          }
        };
      `
    ]
  ]

  // Enable it with pwa
  // shouldPrefetch: false,
});
