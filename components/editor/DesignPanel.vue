<script setup lang="ts">
import { Link2, RotateCcw } from 'lucide-vue-next'
import type { Orientation } from '~/types/resume'
import { DEFAULT_DESIGN } from '~/types/resume'
import { PAPER_SIZES } from '~/utils/paper'
import { ACCENT_PRESETS, FONT_OPTIONS, TEMPLATES, TEMPLATE_MAP } from '~/utils/templates'

const { resume } = useResume()
const design = computed(() => resume.value.design)

const paperGroups = computed(() => {
  const map = new Map<string, typeof PAPER_SIZES>()
  for (const p of PAPER_SIZES) {
    if (!map.has(p.group)) map.set(p.group, [])
    map.get(p.group)!.push(p)
  }
  return Array.from(map.entries())
})

const currentPaper = computed(
  () => PAPER_SIZES.find((p) => p.key === design.value.paper) ?? PAPER_SIZES[0],
)

const isTwoColumn = computed(() => (TEMPLATE_MAP[design.value.template]?.columns ?? 1) === 2)

/** 数值型滑块包装：Slider 的 modelValue 是 number[] */
function numModel(get: () => number, set: (v: number) => void) {
  return computed({
    get: () => [get()],
    set: (v: number[] | number | undefined) => {
      const raw = Array.isArray(v) ? v[0] : Number(v)
      if (typeof raw === 'number' && !Number.isNaN(raw)) set(raw)
    },
  })
}

const fontSizeModel = numModel(
  () => design.value.baseFontSize,
  (v) => (resume.value.design.baseFontSize = v),
)
const lineHeightModel = numModel(
  () => design.value.lineHeight,
  (v) => (resume.value.design.lineHeight = v),
)
const gapModel = numModel(
  () => design.value.sectionGap,
  (v) => (resume.value.design.sectionGap = v),
)
const sideWidthModel = numModel(
  () => design.value.sideWidth,
  (v) => (resume.value.design.sideWidth = v),
)
const marginModel = numModel(
  () => design.value.margins.top,
  (v) => setMargin('top', v),
)

/** 边距双向绑定 */
const marginLock = ref(true)
function setMargin(key: 'top' | 'right' | 'bottom' | 'left', val: number) {
  const v = Math.max(0, Math.min(50, Number(val) || 0))
  if (marginLock.value) {
    const d = resume.value.design
    d.margins = { top: v, right: v, bottom: v, left: v }
  } else {
    resume.value.design.margins[key] = v
  }
}

/** 切换模板时套用推荐样式 */
function applyTemplate(key: string) {
  const tpl = TEMPLATE_MAP[key]
  if (!tpl) return
  const d = resume.value.design
  d.template = key
  d.accent = tpl.accent
  d.baseFontSize = tpl.fontSize
  d.lineHeight = tpl.lineHeight
  d.fontFamily = tpl.fontFamily
  d.headingStyle = tpl.heading
}

function resetDesign() {
  resume.value.design = JSON.parse(JSON.stringify(DEFAULT_DESIGN))
}

const headingOptions = [
  { key: 'bar', label: '色条' },
  { key: 'underline', label: '下划线' },
  { key: 'boxed', label: '色块' },
  { key: 'dot', label: '圆点' },
  { key: 'plain', label: '纯文字' },
] as const
</script>

<template>
  <div class="space-y-5">
    <!-- 纸张 -->
    <section class="space-y-2">
      <div class="flex items-center justify-between">
        <h3
          class="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-neutral-400"
        >
          <span class="h-3 w-[2px] shrink-0 rounded-full bg-brand" />纸张尺寸
        </h3>
        <span class="text-muted-foreground text-[11px]">{{ currentPaper.note }}</span>
      </div>

      <Select v-model="design.paper">
        <SelectTrigger>
          <SelectValue placeholder="选择纸张" />
        </SelectTrigger>
        <SelectContent class="max-h-80">
          <SelectGroup v-for="[group, list] in paperGroups" :key="group">
            <SelectLabel>{{ group }}</SelectLabel>
            <SelectItem v-for="p in list" :key="p.key" :value="p.key">
              {{ p.label }} · {{ p.note }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <div class="flex gap-1">
        <button
          v-for="o in ['portrait', 'landscape'] as Orientation[]"
          :key="o"
          class="flex flex-1 items-center justify-center gap-1.5 rounded-md border py-1.5 text-[12px] transition-colors"
          :class="
            design.orientation === o
              ? 'border-brand bg-brand-soft text-brand-foreground'
              : 'text-muted-foreground hover:bg-accent'
          "
          @click="design.orientation = o"
        >
          <span
            class="border-current/60 rounded-[2px] border"
            :style="o === 'portrait' ? 'width:8px;height:11px' : 'width:11px;height:8px'"
          />
          {{ o === 'portrait' ? '纵向' : '横向' }}
        </button>
      </div>

      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-muted-foreground text-[11px]">页边距 (mm)</span>
          <button
            class="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] transition-colors"
            :class="
              marginLock
                ? 'bg-brand-soft text-brand-foreground'
                : 'text-muted-foreground hover:bg-accent'
            "
            @click="marginLock = !marginLock"
          >
            <Link2 class="size-3" /> {{ marginLock ? '四边联动' : '分别设置' }}
          </button>
        </div>
        <div v-if="marginLock" class="flex items-center gap-2">
          <Slider v-model="marginModel" :min="0" :max="40" :step="1" />
          <span class="w-10 shrink-0 text-right text-[11px] tabular-nums"
            >{{ design.margins.top }} mm</span
          >
        </div>
        <div v-else class="grid grid-cols-4 gap-1.5">
          <div v-for="k in ['top', 'right', 'bottom', 'left'] as const" :key="k" class="space-y-1">
            <Label class="text-[10px] text-muted-foreground">{{
              { top: '上', right: '右', bottom: '下', left: '左' }[k]
            }}</Label>
            <Input
              :model-value="design.margins[k]"
              class="h-7 text-[12px]"
              type="number"
              @update:model-value="(v) => setMargin(k, Number(v))"
            />
          </div>
        </div>
      </div>
    </section>

    <Separator />

    <!-- 模板 -->
    <section class="space-y-2">
      <h3
        class="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-neutral-400"
      >
        <span class="h-3 w-[2px] shrink-0 rounded-full bg-brand" />版式模板
      </h3>
      <div class="grid grid-cols-2 gap-1.5">
        <button
          v-for="t in TEMPLATES"
          :key="t.key"
          class="group relative overflow-hidden rounded-lg border p-2 text-left transition-all"
          :class="
            design.template === t.key ? 'border-neutral-300' : 'hover:border-muted-foreground/30'
          "
          @click="applyTemplate(t.key)"
        >
          <!-- 缩略示意 -->
          <div class="mb-1.5 flex h-11 gap-1 rounded bg-muted/40 p-1">
            <template v-if="t.columns === 2">
              <div class="w-1/3 rounded-sm" :style="{ background: t.accent }" />
              <div class="flex-1 space-y-0.5 py-0.5">
                <div class="h-1 w-3/4 rounded-sm" :style="{ background: t.accent }" />
                <div class="h-0.5 w-full rounded-sm bg-foreground/15" />
                <div class="h-0.5 w-5/6 rounded-sm bg-foreground/15" />
                <div class="h-0.5 w-2/3 rounded-sm bg-foreground/15" />
              </div>
            </template>
            <template v-else>
              <div class="flex-1 space-y-0.5 py-0.5">
                <div
                  class="h-1.5 rounded-sm"
                  :style="{
                    background: t.accent,
                    width: t.header === 'center' ? '45%' : '60%',
                    margin: t.header === 'center' ? '0 auto' : '0',
                  }"
                />
                <div
                  class="h-0.5 rounded-sm opacity-40"
                  :style="{
                    background: t.accent,
                    width: '80%',
                    margin: t.header === 'center' ? '0 auto' : '0',
                  }"
                />
                <div class="mt-1 h-0.5 w-full rounded-sm bg-foreground/15" />
                <div class="h-0.5 w-5/6 rounded-sm bg-foreground/15" />
                <div class="h-0.5 w-3/4 rounded-sm bg-foreground/15" />
              </div>
            </template>
          </div>
          <div class="text-[12px] font-medium">{{ t.label }}</div>
          <div class="text-muted-foreground mt-0.5 line-clamp-2 text-[10px] leading-tight">
            {{ t.desc }}
          </div>
        </button>
      </div>
    </section>

    <Separator />

    <!-- 主题色 -->
    <section class="space-y-2">
      <h3
        class="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-neutral-400"
      >
        <span class="h-3 w-[2px] shrink-0 rounded-full bg-brand" />主题色
      </h3>
      <div class="flex flex-wrap items-center gap-1.5">
        <button
          v-for="c in ACCENT_PRESETS"
          :key="c.value"
          class="size-6 rounded-md border-2 transition-transform hover:scale-110"
          :class="
            design.accent.toLowerCase() === c.value.toLowerCase()
              ? 'border-foreground'
              : 'border-transparent'
          "
          :style="{ background: c.value }"
          :title="c.label"
          @click="design.accent = c.value"
        />
        <label
          class="relative flex size-6 cursor-pointer items-center justify-center overflow-hidden rounded-md border bg-[conic-gradient(from_0deg,red,yellow,lime,cyan,blue,magenta,red)]"
          title="自定义颜色"
        >
          <input
            type="color"
            :value="design.accent"
            class="absolute inset-0 cursor-pointer opacity-0"
            @input="(e) => (design.accent = (e.target as HTMLInputElement).value)"
          />
        </label>
      </div>
    </section>

    <Separator />

    <!-- 字体 -->
    <section class="space-y-2">
      <h3
        class="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-neutral-400"
      >
        <span class="h-3 w-[2px] shrink-0 rounded-full bg-brand" />字体
      </h3>
      <Select v-model="design.fontFamily">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="f in FONT_OPTIONS" :key="f.key" :value="f.key">
            {{ f.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </section>

    <Separator />

    <!-- 排版参数 -->
    <section class="space-y-3.5">
      <h3
        class="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-neutral-400"
      >
        <span class="h-3 w-[2px] shrink-0 rounded-full bg-brand" />排版参数
      </h3>

      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-[11px]">
          <span class="text-muted-foreground">正文字号</span>
          <span class="tabular-nums">{{ design.baseFontSize.toFixed(1) }} pt</span>
        </div>
        <Slider v-model="fontSizeModel" :min="7.5" :max="13" :step="0.1" />
      </div>

      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-[11px]">
          <span class="text-muted-foreground">行高</span>
          <span class="tabular-nums">{{ design.lineHeight.toFixed(2) }}</span>
        </div>
        <Slider v-model="lineHeightModel" :min="1.15" :max="2.1" :step="0.01" />
      </div>

      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-[11px]">
          <span class="text-muted-foreground">模块间距</span>
          <span class="tabular-nums">{{ design.sectionGap.toFixed(2) }} ×</span>
        </div>
        <Slider v-model="gapModel" :min="0.3" :max="2.2" :step="0.05" />
      </div>

      <div v-if="isTwoColumn" class="space-y-1.5">
        <div class="flex items-center justify-between text-[11px]">
          <span class="text-muted-foreground">侧栏宽度</span>
          <span class="tabular-nums">{{ design.sideWidth.toFixed(0) }} %</span>
        </div>
        <Slider v-model="sideWidthModel" :min="22" :max="45" :step="0.5" />
      </div>
    </section>

    <Separator />

    <!-- 标题样式 -->
    <section class="space-y-2">
      <h3
        class="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-neutral-400"
      >
        <span class="h-3 w-[2px] shrink-0 rounded-full bg-brand" />模块标题样式
      </h3>
      <div class="flex flex-wrap gap-1">
        <button
          v-for="h in headingOptions"
          :key="h.key"
          class="rounded-md border px-2 py-1 text-[11.5px] transition-colors"
          :class="
            design.headingStyle === h.key
              ? 'border-brand bg-brand-soft text-brand-foreground'
              : 'text-muted-foreground hover:bg-accent'
          "
          @click="design.headingStyle = h.key"
        >
          {{ h.label }}
        </button>
      </div>
    </section>

    <Separator />

    <section class="flex items-center justify-between">
      <label class="flex cursor-pointer items-center gap-2 text-[12.5px]">
        <Switch v-model="design.showContacts" />
        显示联系方式
      </label>
      <Button
        variant="ghost"
        size="xs"
        class="gap-1 text-muted-foreground"
        @click="resetDesign"
      >
        <RotateCcw class="size-3" /> 恢复默认
      </Button>
    </section>
  </div>
</template>
