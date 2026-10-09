<script setup lang="ts">
import {
  ArrowRight,
  FileDown,
  FileText,
  HardDrive,
  LayoutTemplate,
  Palette,
  PencilRuler,
  Ruler,
  Type,
  Wand2,
} from 'lucide-vue-next'
import { createSampleResume } from '~/composables/useResume'
import { PAPER_SIZES } from '~/utils/paper'
import { TEMPLATES } from '~/utils/templates'

useHead({
  title: 'ResumeForge · 在线简历排版与 PDF 导出',
  meta: [
    {
      name: 'description',
      content:
        '在线简历编辑器：智能一页排版、14 种纸张规格、多页 PDF 导出。无需注册，数据只保存在本地浏览器。',
    },
  ],
})

/** 展示用简历（独立数据，不触碰编辑器状态） */
const showcase = computed(() => {
  const d = createSampleResume()
  /* 首页只展示核心模块，荣誉/语言/证书这类次要模块略去。
     宁可少展示两个模块，也不要把内容硬压小塞满——那样会显得拥挤。 */
  d.sections = d.sections.filter(
    (s) => !['awards', 'languages', 'certificates'].includes(s.type),
  )
  d.design.template = 'modern'
  d.design.accent = '#2563eb'
  d.design.baseFontSize = 10.2
  d.design.margins = { top: 14, right: 14, bottom: 14, left: 14 }
  d.design.lineHeight = 1.55
  d.design.headingStyle = 'bar'
  d.design.fontFamily = 'sans'
  d.basics.showAvatar = false
  return d
})

/* A4 @96dpi：793.7 × 1122.5，页边距 14mm ≈ 52.9 */
const PAGE_W = (210 * 96) / 25.4
const PAGE_H = (297 * 96) / 25.4
const PAD = (14 * 96) / 25.4
const SHOW_W = 440
const SHOW_SCALE = SHOW_W / PAGE_W
const SHOW_H = Math.ceil(PAGE_H * SHOW_SCALE)

const features = [
  {
    icon: Wand2,
    title: '智能一页',
    desc: '自动测量内容高度并按比例收紧字号与行距，让简历刚好落在一页之内；内容不足时也能自动撑满。',
  },
  {
    icon: Ruler,
    title: '多尺寸纸张',
    desc: 'A4、Letter、16 开、幻灯片等 14 种规格，横竖可切换，页边距四边独立可调，排版以毫米为唯一单位。',
  },
  {
    icon: FileDown,
    title: '多页 PDF 导出',
    desc: '按真实分页逐页导出，最高 300 DPI；也可走浏览器打印通道，得到文字可搜索的矢量 PDF，更易通过 ATS。',
  },
  {
    icon: LayoutTemplate,
    title: '五套版式模板',
    desc: '单栏、双栏、色带、极简、紧凑各有取舍，切换模板会自动套用配套的主题色与字号，内容不会丢。',
  },
  {
    icon: PencilRuler,
    title: '拖拽式编辑',
    desc: '模块与条目均可按住手柄拖动排序，卡片头部就地改标题，改动实时反映到右侧预览。',
  },
  {
    icon: HardDrive,
    title: '数据留在本地',
    desc: '内容保存在浏览器 localStorage，不上传任何服务器。支持 JSON 导入导出备份，随时可以带走。',
  },
]

const paperGroups = computed(() => {
  const map = new Map<string, typeof PAPER_SIZES>()
  for (const p of PAPER_SIZES) {
    if (!map.has(p.group)) map.set(p.group, [])
    map.get(p.group)!.push(p)
  }
  return Array.from(map.entries())
})

const steps = [
  { t: '选模板', d: '五套版式，切换即套用配套的配色与字号。' },
  { t: '填内容', d: '左侧输入，右侧实时成稿，所有改动自动保存。' },
  { t: '导出投递', d: '按目标公司的规格导出 PDF，直接发送。' },
]

/** Hero 左列的能力标签：让两栏视觉重量更接近，不至于左轻右重 */
const highlights = [
  { icon: LayoutTemplate, label: '5 套版式模板' },
  { icon: Palette, label: '12 组主题配色' },
  { icon: Type, label: '6 种中英文字体' },
  { icon: Ruler, label: '14 种纸张规格' },
]
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-white text-neutral-900 antialiased">
    <!-- ================= 导航 ================= -->
    <header class="sticky top-0 z-50 border-b border-neutral-200 bg-white/85 backdrop-blur-md">
      <div class="mx-auto flex h-14 max-w-6xl items-center gap-8 px-6">
        <NuxtLink to="/" class="flex items-center gap-2">
          <span
            class="bg-brand flex size-6 items-center justify-center rounded-md text-[11px] font-bold text-white"
            >R</span
          >
          <span class="text-[14.5px] font-semibold tracking-tight">ResumeForge</span>
        </NuxtLink>

        <nav class="hidden items-center gap-7 md:flex">
          <a
            href="#features"
            class="text-[13.5px] text-neutral-500 transition-colors hover:text-neutral-900"
            >功能</a
          >
          <a
            href="#templates"
            class="text-[13.5px] text-neutral-500 transition-colors hover:text-neutral-900"
            >模板</a
          >
          <a
            href="#paper"
            class="text-[13.5px] text-neutral-500 transition-colors hover:text-neutral-900"
            >纸张规格</a
          >
        </nav>

        <div class="flex-1" />

        <NuxtLink
          to="/editor"
          class="hidden text-[13.5px] text-neutral-500 transition-colors hover:text-neutral-900 sm:block"
          >打开编辑器</NuxtLink
        >
        <Button as-child size="sm" class="h-8 px-3.5">
          <NuxtLink to="/editor">开始制作</NuxtLink>
        </Button>
      </div>
    </header>

    <!-- ================= Hero ================= -->
    <section class="relative overflow-hidden border-b border-neutral-200">
      <!-- 顶部径向光晕：轻微的视觉焦点，不喧宾夺主 -->
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(79,70,229,0.16),transparent)]"
      />

      <div class="relative mx-auto max-w-6xl px-6 pt-12 pb-16 lg:pt-16 lg:pb-20">
        <div class="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <!-- 左：文案 -->
          <div class="text-center lg:text-left">
            <div
              class="mx-auto mb-7 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] shadow-lg shadow-indigo-500/25 lg:mx-0"
            >
              <FileText class="size-6 text-white" :stroke-width="2" />
            </div>

            <h1 class="mb-6">
              <SparklesText
                text="ResumeForge"
                :sparkles-count="12"
                class="text-[40px] leading-none font-extrabold tracking-tight sm:text-[54px]"
              />
            </h1>

            <p class="mx-auto max-w-lg text-[16px] leading-relaxed text-neutral-500 lg:mx-0">
              一款专注内容本身的简历制作工具，无需操心排版。具备<strong
                class="font-medium text-neutral-700"
                >智能一页</strong
              >、<strong class="font-medium text-neutral-700">多尺寸纸张</strong>、<strong
                class="font-medium text-neutral-700"
                >多页 PDF 导出</strong
              >。
            </p>

            <!-- 能力标签 -->
            <div
              class="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2.5 lg:justify-start"
            >
              <span
                v-for="h in highlights"
                :key="h.label"
                class="inline-flex items-center gap-1.5 text-[13px] text-neutral-500"
              >
                <component :is="h.icon" class="text-brand size-3.5" :stroke-width="2.2" />
                {{ h.label }}
              </span>
            </div>

            <div class="mt-9 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <RainbowButton :speed="3">
                <NuxtLink to="/editor">✨ 立即制作简历</NuxtLink>
              </RainbowButton>
              <Button as-child variant="outline" size="lg" class="h-11 px-5">
                <a href="#templates">浏览模板</a>
              </Button>
            </div>

            <p class="mt-7 text-[12.5px] text-neutral-400">
              免费使用 · 无需注册 · 数据只保存在本地浏览器
            </p>
          </div>

          <!-- 右：真实渲染的简历 -->
          <div class="flex justify-center">
            <div>
              <div
                class="paper-shadow relative overflow-hidden rounded-lg border border-neutral-200 bg-white"
                :style="{ width: `${SHOW_W}px`, height: `${SHOW_H}px` }"
              >
                <div
                  class="absolute top-0 left-0 origin-top-left"
                  :style="{
                    width: `${PAGE_W}px`,
                    height: `${PAGE_H}px`,
                    padding: `${PAD}px`,
                    transform: `scale(${SHOW_SCALE})`,
                  }"
                >
                  <ResumeBody :data="showcase" :fit-scale="1" :clip="false" />
                </div>

                <!-- 状态浮层 -->
                <div
                  class="pointer-events-none absolute right-4 bottom-4 flex items-center gap-2 rounded-md border border-neutral-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm"
                >
                  <Wand2 class="text-brand size-3.5" />
                  <span class="text-[11.5px] font-medium text-neutral-700">智能一页已生效</span>
                  <span class="text-[11.5px] tabular-nums text-neutral-400">94%</span>
                </div>
              </div>

              <p class="mt-4 text-center text-[12px] text-neutral-400">
                真实渲染输出 · A4 210 × 297 mm · 1 页
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= 功能 ================= -->
    <section id="features" class="scroll-mt-16 border-b border-neutral-200 bg-neutral-50">
      <div class="mx-auto max-w-6xl px-6 py-20">
        <div class="text-center">
          <h2 class="text-[30px] font-bold tracking-[-0.02em]">主要特色</h2>
          <p class="mx-auto mt-3 max-w-lg text-[14px] leading-relaxed text-neutral-500">
            把简历工具该做好的事做扎实：排版自动化、纸张可控、导出可靠。
          </p>
        </div>

        <div class="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="f in features"
            :key="f.title"
            class="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div class="bg-brand-soft mb-4 flex size-12 items-center justify-center rounded-lg">
              <component :is="f.icon" class="text-brand size-6" :stroke-width="2" />
            </div>
            <h3 class="text-[16px] font-semibold">{{ f.title }}</h3>
            <p class="mt-2 text-[13px] leading-relaxed text-neutral-500">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= 工作流 ================= -->
    <section class="border-b border-neutral-200 bg-white">
      <div class="mx-auto max-w-6xl px-6 py-14">
        <div class="grid gap-10 md:grid-cols-3">
          <div v-for="(s, i) in steps" :key="s.t" class="flex gap-4">
            <span
              class="border-brand-border bg-brand-soft text-brand mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold"
              >{{ i + 1 }}</span
            >
            <div>
              <div class="text-[14px] font-semibold">{{ s.t }}</div>
              <p class="mt-1 text-[13px] leading-relaxed text-neutral-500">{{ s.d }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= 模板 ================= -->
    <section id="templates" class="scroll-mt-16 border-b border-neutral-200 bg-neutral-50">
      <div class="mx-auto max-w-6xl px-6 py-20">
        <div class="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 class="text-[28px] font-semibold tracking-[-0.02em]">版式模板</h2>
            <p class="mt-3 max-w-lg text-[13.5px] leading-relaxed text-neutral-500">
              五套经过排版验证的版式，覆盖单栏与双栏。切换模板会自动套用匹配的主题色与字号，
              也可以逐项自定义。
            </p>
          </div>
          <NuxtLink
            to="/editor"
            class="text-brand inline-flex items-center gap-1.5 text-[13.5px] font-medium transition-opacity hover:opacity-75"
          >
            在编辑器中试用
            <ArrowRight class="size-3.5" />
          </NuxtLink>
        </div>

        <div class="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          <NuxtLink v-for="t in TEMPLATES" :key="t.key" to="/editor" class="group block">
            <div
              class="overflow-hidden rounded-lg border border-neutral-200 bg-white p-3 shadow-sm transition-all group-hover:border-neutral-300 group-hover:shadow-md"
            >
              <div class="flex aspect-[210/297] gap-2">
                <!-- 双栏 -->
                <template v-if="t.columns === 2">
                  <div class="w-1/3 space-y-1.5 border-r border-neutral-100 pr-2">
                    <div class="h-1 w-3/4 rounded-sm" :style="{ background: t.accent }" />
                    <div class="h-0.5 w-full rounded-sm bg-neutral-200" />
                    <div class="h-0.5 w-5/6 rounded-sm bg-neutral-200" />
                    <div class="h-0.5 w-full rounded-sm bg-neutral-200" />
                  </div>
                  <div class="flex-1 space-y-2 pt-0.5">
                    <div class="h-1.5 w-3/5 rounded-sm" :style="{ background: t.accent }" />
                    <div class="space-y-1">
                      <div class="h-0.5 w-full rounded-sm bg-neutral-200" />
                      <div class="h-0.5 w-11/12 rounded-sm bg-neutral-200" />
                    </div>
                    <div class="h-1 w-2/5 rounded-sm" :style="{ background: t.accent }" />
                    <div class="space-y-1">
                      <div class="h-0.5 w-full rounded-sm bg-neutral-200" />
                      <div class="h-0.5 w-3/4 rounded-sm bg-neutral-200" />
                    </div>
                  </div>
                </template>
                <!-- 单栏 -->
                <template v-else>
                  <div class="flex-1 space-y-2 pt-0.5">
                    <div
                      class="h-1.5 rounded-sm"
                      :style="{
                        background: t.accent,
                        width: t.header === 'center' ? '46%' : '62%',
                        margin: t.header === 'center' ? '0 auto' : '0',
                      }"
                    />
                    <div
                      class="h-0.5 rounded-sm bg-neutral-200"
                      :style="{ width: '72%', margin: t.header === 'center' ? '0 auto' : '0' }"
                    />
                    <div class="space-y-1 pt-1.5">
                      <div class="h-1 w-2/5 rounded-sm" :style="{ background: t.accent }" />
                      <div class="h-0.5 w-full rounded-sm bg-neutral-200" />
                      <div class="h-0.5 w-5/6 rounded-sm bg-neutral-200" />
                    </div>
                    <div class="space-y-1 pt-1">
                      <div class="h-1 w-1/3 rounded-sm" :style="{ background: t.accent }" />
                      <div class="h-0.5 w-full rounded-sm bg-neutral-200" />
                      <div class="h-0.5 w-4/6 rounded-sm bg-neutral-200" />
                    </div>
                  </div>
                </template>
              </div>
            </div>
            <div class="mt-3 text-[13px] font-medium">{{ t.label }}</div>
            <div class="mt-0.5 text-[11.5px] leading-snug text-neutral-400">{{ t.desc }}</div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ================= 纸张 ================= -->
    <section id="paper" class="scroll-mt-16 border-b border-neutral-200 bg-white">
      <div class="mx-auto max-w-6xl px-6 py-20">
        <h2 class="text-[28px] font-semibold tracking-[-0.02em]">14 种纸张规格</h2>
        <p class="mt-3 max-w-lg text-[13.5px] leading-relaxed text-neutral-500">
          排版以毫米为唯一单位，屏幕预览与打印结果严格一致。
        </p>

        <div class="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="[group, list] in paperGroups" :key="group">
            <h3
              class="border-b border-neutral-200 pb-2 text-[11.5px] font-medium tracking-wide text-neutral-400 uppercase"
            >
              {{ group }}
            </h3>
            <ul class="mt-1">
              <li
                v-for="p in list"
                :key="p.key"
                class="flex items-baseline justify-between gap-4 py-2"
              >
                <span class="text-[13.5px] font-medium text-neutral-800">{{ p.label }}</span>
                <span class="text-[12px] text-neutral-400">{{ p.note.split(' · ')[0] }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= CTA ================= -->
    <section class="border-b border-neutral-200 bg-neutral-50">
      <div class="mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 class="text-[30px] font-bold tracking-[-0.02em]">准备好制作你的简历了吗？</h2>
        <p class="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-neutral-500">
          无需注册，直接开始编辑。所有数据保存在本地浏览器，不会上传到任何服务器。
        </p>
        <div class="mt-9 flex justify-center">
          <RainbowButton :speed="3">
            <NuxtLink to="/editor">🚀 开始制作</NuxtLink>
          </RainbowButton>
        </div>
      </div>
    </section>

    <!-- ================= Footer ================= -->
    <footer class="bg-white py-8">
      <div class="mx-auto max-w-5xl px-6 text-center text-[12.5px] text-neutral-500">
        <p class="mb-2">
          Made with Nuxt 3 · Vue 3 ·
          <a
            href="https://www.shadcn-vue.com/"
            target="_blank"
            rel="noreferrer"
            class="underline transition-colors hover:text-neutral-900"
            >shadcn-vue</a
          >
        </p>
        <p class="text-neutral-400">数据保存在本地浏览器 · 不上传任何服务器</p>
      </div>
    </footer>
  </div>
</template>
