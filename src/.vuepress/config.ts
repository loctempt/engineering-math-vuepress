import { defineUserConfig } from "vuepress";
import paragraphCommentPlugin from './plugins/paragraph-comment.ts'
import testPlugin from "./plugins/test-plugin.ts";
import { viteBundler } from '@vuepress/bundler-vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'

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
  bundler: viteBundler({
    viteOptions: {
      ssr: {
        noExternal: ['naive-ui']
      },
      optimizeDeps: {
        include: ['naive-ui']
      },
      plugins: [
        Components({
          resolvers: [
            IconsResolver({
              prefix: 'i',                 // 组件前缀，可改成 false 省掉
              enabledCollections: ['fa6-solid']
            })
          ]
        }),
        Icons({ compiler: 'vue3' })
      ]
    }
  })
});
