import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },

  // 纯客户端工具：关闭 SSR，避免测量逻辑与服务端渲染的冲突
  ssr: false,

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  // shadcn-vue 风格：components 目录扁平化，Button.vue -> <Button />
  components: [{ path: '~/components', pathPrefix: false }],

  imports: {
    dirs: ['composables/**', 'utils/**', 'lib'],
  },

  app: {
    head: {
      title: 'ResumeForge · 在线简历制作工具',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '智能一页 · 多尺寸纸张 · 多页 PDF 导出' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
        },
      ],
    },
  },
})
