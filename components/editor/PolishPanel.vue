<script setup lang="ts">
import { AlertTriangle, CheckCircle2, Info, Lightbulb, Sparkles, Wand2 } from 'lucide-vue-next'
import type { FitMode } from '~/types/resume'

const { resume } = useResume()
const { fitMode, stats, zoom } = useEditor()

const fitOptions: { value: FitMode; label: string; hint: string }[] = [
  { value: 'shrink', label: '压缩到一页', hint: '内容多于 1 页时自动缩小' },
  { value: 'stretch', label: '撑满一页', hint: '内容不足时自动放大并用满页面' },
  { value: 'off', label: '关闭', hint: '保持手动设置的字号与行距' },
]

/** ---- 内容体检 ---- */
interface Issue {
  level: 'warn' | 'info'
  text: string
  section?: string
}

const issues = computed<Issue[]>(() => {
  const list: Issue[] = []
  for (const sec of resume.value.sections) {
    if (!sec.visible) continue
    for (const it of sec.items) {
      if (it.hidden) continue
      for (const b of it.bullets ?? []) {
        const t = (b ?? '').trim()
        if (t.length > 46) {
          list.push({
            level: 'warn',
            text: `要点过长（${t.length} 字），建议控制在 40 字内：${t.slice(0, 18)}…`,
            section: sec.title,
          })
        }
      }
      if ((it.bullets ?? []).filter((b) => b.trim()).length > 6) {
        list.push({
          level: 'info',
          text: `「${it.title || sec.title}」有 ${it.bullets!.length} 条要点，建议精简到 3~5 条`,
          section: sec.title,
        })
      }
    }
    if (sec.visible && !sec.items.some((i) => !i.hidden)) {
      list.push({
        level: 'info',
        text: `「${sec.title}」是空的，建议填写或隐藏`,
        section: sec.title,
      })
    }
  }
  if (!resume.value.basics.email && !resume.value.basics.phone) {
    list.push({ level: 'warn', text: '没有填写邮箱和手机，HR 无法联系你' })
  }
  if (!resume.value.sections.some((s) => s.visible && s.type === 'summary')) {
    list.push({ level: 'info', text: '建议添加「个人简介」，快速传达你的核心竞争力' })
  }
  return list.slice(0, 12)
})

const wordCount = computed(() => {
  let n = 0
  const b = resume.value.basics
  n += [b.name, b.headline, b.location].filter(Boolean).join('').length
  for (const sec of resume.value.sections) {
    if (!sec.visible) continue
    for (const it of sec.items) {
      if (it.hidden) continue
      n += (it.title ?? '').length + (it.subtitle ?? '').length + (it.description ?? '').length
      n += (it.bullets ?? []).join('').length
      n += (it.tags ?? []).join('').length
    }
  }
  return n
})

const fillPercent = computed(() => Math.round(Math.min(stats.value.fillRatio, 1) * 100))

const density = computed(() => {
  const n = wordCount.value
  if (n < 350)
    return { label: '偏稀疏', tone: 'text-amber-600', hint: '内容偏少，开启「撑满一页」会更饱满' }
  if (n <= 1100)
    return {
      label: '健康',
      tone: 'text-emerald-600',
      hint: '信息密度适中，适合大多数 HR 的阅读习惯',
    }
  return { label: '偏密集', tone: 'text-rose-600', hint: '内容较多，建议精简要点或使用更大的纸张' }
})

/** 一键把当前简历压到一页 */
function squeezeToOnePage() {
  const d = resume.value.design
  d.baseFontSize = 9.4
  d.lineHeight = 1.42
  d.sectionGap = 0.7
  d.margins = { top: 11, right: 12, bottom: 11, left: 12 }
  fitMode.value = 'shrink'
}

function relieveDensity() {
  const d = resume.value.design
  d.baseFontSize = 10.2
  d.lineHeight = 1.6
  d.sectionGap = 1.1
  d.margins = { top: 15, right: 15, bottom: 15, left: 15 }
  fitMode.value = 'off'
}
</script>

<template>
  <div class="space-y-5">
    <!-- 智能一页 -->
    <section class="space-y-2">
      <h3
        class="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-neutral-400"
      >
        <span class="h-3 w-[2px] shrink-0 rounded-full bg-brand" />智能一页
      </h3>
      <div class="space-y-1">
        <button
          v-for="o in fitOptions"
          :key="o.value"
          class="flex w-full items-start gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors"
          :class="fitMode === o.value ? 'border-brand bg-brand-soft' : 'hover:bg-accent'"
          @click="fitMode = o.value"
        >
          <span
            class="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border"
            :class="fitMode === o.value ? 'border-brand bg-brand' : 'border-muted-foreground/40'"
          >
            <CheckCircle2 v-if="fitMode === o.value" class="size-3 text-white" />
          </span>
          <span class="min-w-0">
            <span class="block text-[12.5px] font-medium">{{ o.label }}</span>
            <span class="text-muted-foreground block text-[11px]">{{ o.hint }}</span>
          </span>
        </button>
      </div>
    </section>

    <!-- 实时状态 -->
    <section class="space-y-2.5 rounded-xl border-neutral-200/90 bg-white p-3">
      <div class="flex items-baseline justify-between">
        <span class="text-[12px] font-semibold">当前排版</span>
        <span class="text-[11px] text-muted-foreground">
          {{ stats.pages }} 页 · 缩放 {{ Math.round(stats.fitScale * 100) }}%
        </span>
      </div>
      <div class="space-y-1">
        <div class="flex items-center justify-between text-[11px]">
          <span class="text-muted-foreground">首页填充率</span>
          <span class="tabular-nums">{{ fillPercent }}%</span>
        </div>
        <div class="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            class="h-full rounded-full transition-all"
            :class="
              fillPercent > 96
                ? 'bg-rose-400'
                : fillPercent < 70
                  ? 'bg-amber-400'
                  : 'bg-emerald-500'
            "
            :style="{ width: `${Math.min(fillPercent, 100)}%` }"
          />
        </div>
      </div>
      <div class="flex items-center justify-between text-[11px]">
        <span class="text-muted-foreground">正文字数</span>
        <span class="tabular-nums">
          {{ wordCount }} 字 ·
          <span :class="density.tone">{{ density.label }}</span>
        </span>
      </div>
      <p class="text-muted-foreground text-[11px] leading-relaxed">{{ density.hint }}</p>

      <div
        v-if="stats.overflow > 0"
        class="flex gap-1.5 rounded-md bg-rose-50 px-2 py-1.5 text-[11px] leading-relaxed text-rose-700"
      >
        <AlertTriangle class="mt-px size-3.5 shrink-0" />
        <span>{{ stats.overflow }} 个条目本身高于一页，已被强制分页。</span>
      </div>
    </section>

    <!-- 快捷动作 -->
    <section class="space-y-2">
      <h3
        class="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-neutral-400"
      >
        <span class="h-3 w-[2px] shrink-0 rounded-full bg-brand" />快捷排版
      </h3>
      <div class="grid grid-cols-2 gap-1.5">
        <Button variant="outline" size="sm" class="gap-1.5" @click="squeezeToOnePage">
          <Wand2 class="size-3.5" /> 压到一页
        </Button>
        <Button variant="outline" size="sm" class="gap-1.5" @click="relieveDensity">
          <SparkleIcon /> 舒展排版
        </Button>
      </div>
      <p class="text-muted-foreground text-[11px] leading-relaxed">
        一键调整字号、行距、边距与模块间距，均为可撤销操作。
      </p>
    </section>

    <!-- 内容体检 -->
    <section class="space-y-2">
      <div class="flex items-center gap-1.5">
        <h3
          class="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-neutral-400"
        >
          <span class="h-3 w-[2px] shrink-0 rounded-full bg-brand" />内容体检
        </h3>
        <Badge v-if="issues.length" variant="secondary" class="h-4 px-1.5 text-[10px]">
          {{ issues.length }} 条建议
        </Badge>
      </div>

      <div
        v-if="!issues.length"
        class="flex items-center gap-2 rounded-lg border-neutral-200/90 bg-white px-3 py-2.5 text-[12px] text-emerald-700"
      >
        <CheckCircle2 class="size-4 shrink-0" />
        没有发现明显问题，可以放心投递。
      </div>

      <div v-else class="space-y-1.5">
        <div
          v-for="(iss, i) in issues"
          :key="i"
          class="flex gap-2 rounded-lg border-neutral-200/90 bg-white px-2.5 py-2 text-[11.5px] leading-relaxed"
        >
          <AlertTriangle
            v-if="iss.level === 'warn'"
            class="mt-0.5 size-3.5 shrink-0 text-amber-500"
          />
          <Info v-else class="mt-0.5 size-3.5 shrink-0 text-sky-500" />
          <span class="min-w-0">
            <span v-if="iss.section" class="text-muted-foreground">[{{ iss.section }}] </span>
            {{ iss.text }}
          </span>
        </div>
      </div>
    </section>

    <section class="rounded-xl border bg-amber-50/60 p-3">
      <div class="flex items-center gap-1.5 text-[12px] font-semibold text-amber-800">
        <Lightbulb class="size-3.5" /> 一页简历小贴士
      </div>
      <ul class="mt-1.5 space-y-1 text-[11px] leading-relaxed text-amber-800/90">
        <li>· 工作 3 年内建议严格控制在 1 页，资深可放宽到 2 页</li>
        <li>· 要点用「动词 + 动作 + 可量化结果」结构，例如「重构 X，耗时下降 40%」</li>
        <li>· 与目标岗位无关的经历优先精简，而不是整体缩小字号</li>
        <li>· 导出前把预览缩放调到 100%，确认小字号下仍然清晰可读</li>
      </ul>
    </section>
  </div>
</template>
