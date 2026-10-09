<script setup lang="ts">
import {
  AlertTriangle,
  Check,
  FileDown,
  FileJson,
  FilePlus2,
  Redo2,
  RefreshCcw,
  Undo2,
  Upload,
  Wand2,
  ZoomIn,
  ZoomOut,
} from 'lucide-vue-next'
import type { FitMode } from '~/types/resume'
import { createEmptyResume, createSampleResume } from '~/composables/useResume'

const { resume, undo, redo, canUndo, canRedo, savedAt } = useResume()
const {
  zoom,
  fitMode,
  zoomIn,
  zoomOut,
  zoomActual,
  stats,
  exportOpen,
  expandedId,
  openSections,
  activeTab,
} = useEditor()

const fitModeItems: { value: FitMode; label: string; desc: string }[] = [
  { value: 'shrink', label: '压缩到一页', desc: '内容超出时自动收紧字号，直到刚好一页' },
  { value: 'stretch', label: '撑满一页', desc: '内容不足时自动放大，不留大片空白' },
  { value: 'off', label: '关闭', desc: '保持手动设置的字号与行距' },
]

const fitLabel = computed(
  () => fitModeItems.find((i) => i.value === fitMode.value)?.label ?? '智能一页',
)

const savedLabel = computed(() => {
  if (!savedAt.value) return '未保存'
  const diff = Date.now() - savedAt.value
  if (diff < 8000) return '已保存'
  const d = new Date(savedAt.value)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())} 已保存`
})

const compressed = computed(() => stats.value.fitScale < 0.985 && fitMode.value !== 'off')

const docTitle = computed(() => {
  const n = resume.value.basics.name?.trim()
  return n ? `${n}的简历` : '未命名简历'
})

const fileInput = ref<HTMLInputElement | null>(null)

function exportJson() {
  const blob = new Blob([JSON.stringify(resume.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${resume.value.basics.name || '简历'}.resumeforge.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 3000)
}

function importJson(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result))
      if (data?.basics && Array.isArray(data?.sections)) resume.value = data
    } catch {
      /* 非法文件：忽略 */
    }
  }
  reader.readAsText(file)
  ;(e.target as HTMLInputElement).value = ''
}

function startBlank() {
  if (!window.confirm('将清空当前内容并新建一份空白简历，确定吗？（可以用撤销恢复）')) return
  resume.value = createEmptyResume()
  expandedId.value = ''
  openSections.value = {}
  activeTab.value = 'content'
}

function loadSample() {
  if (!window.confirm('将用示例内容替换当前简历，确定吗？（可以用撤销恢复）')) return
  resume.value = createSampleResume()
  expandedId.value = ''
  openSections.value = {}
  activeTab.value = 'content'
}
</script>

<template>
  <header
    class="relative z-20 flex h-12 shrink-0 items-center gap-2 border-b border-neutral-200 bg-white px-3 select-none"
  >
    <!-- 品牌 -->
    <NuxtLink
      to="/"
      class="flex items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-neutral-100"
      title="返回首页"
    >
      <span
        class="flex size-6 items-center justify-center rounded-md bg-neutral-900 text-[11px] font-bold text-white"
        >R</span
      >
      <span class="hidden text-[13.5px] font-semibold tracking-tight sm:block">ResumeForge</span>
    </NuxtLink>

    <div class="mx-1 h-4 w-px bg-neutral-200" />

    <!-- 当前文档 -->
    <div class="hidden min-w-0 sm:block">
      <div class="max-w-[220px] truncate text-[12.5px] leading-tight font-medium text-neutral-700">
        {{ docTitle }}
      </div>
      <div class="text-[10.5px] leading-tight text-neutral-400">{{ savedLabel }}</div>
    </div>

    <div class="mx-1 hidden h-4 w-px bg-neutral-200 sm:block" />

    <!-- 撤销 / 重做 -->
    <button
      class="flex size-7 items-center justify-center rounded text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-30"
      :disabled="!canUndo"
      title="撤销"
      @click="undo"
    >
      <Undo2 class="size-3.5" />
    </button>
    <button
      class="flex size-7 items-center justify-center rounded text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-30"
      :disabled="!canRedo"
      title="重做"
      @click="redo"
    >
      <Redo2 class="size-3.5" />
    </button>

    <div class="flex-1" />

    <!-- 智能一页 -->
    <Popover>
      <PopoverTrigger as-child>
        <button
          class="flex h-8 items-center gap-2 rounded-md border px-2.5 text-[12.5px] transition-colors"
          :class="
            fitMode !== 'off'
              ? 'border-brand text-neutral-900'
              : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
          "
        >
          <span
            class="size-1.5 rounded-full"
            :class="fitMode !== 'off' ? 'bg-emerald-500' : 'bg-neutral-300'"
          />
          <span class="hidden font-medium md:inline">智能一页</span>
          <span class="text-neutral-500">{{ fitLabel }}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" class="w-72 p-1.5">
        <div class="px-2 pt-1.5 pb-2">
          <div class="text-[12.5px] font-medium text-neutral-900">智能一页排版</div>
          <p class="mt-1 text-[11.5px] leading-relaxed text-neutral-500">
            自动测量内容高度并按比例微调字号与行距，让简历刚好落在一页之内。
          </p>
        </div>
        <div class="space-y-0.5">
          <button
            v-for="m in fitModeItems"
            :key="m.value"
            class="flex w-full items-start gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-neutral-100"
            @click="fitMode = m.value"
          >
            <span
              class="mt-px flex size-4 shrink-0 items-center justify-center rounded-full border"
              :class="fitMode === m.value ? 'border-brand bg-brand-soft' : 'border-neutral-300'"
            >
              <Check v-if="fitMode === m.value" class="size-2.5 text-white" :stroke-width="3" />
            </span>
            <span class="min-w-0">
              <span class="block text-[12.5px] font-medium text-neutral-900">{{ m.label }}</span>
              <span class="mt-0.5 block text-[11px] leading-snug text-neutral-500">{{
                m.desc
              }}</span>
            </span>
          </button>
        </div>

        <div
          v-if="compressed || stats.overflow > 0"
          class="mt-1.5 space-y-1 rounded-md bg-neutral-50 px-2.5 py-2"
        >
          <p v-if="compressed" class="text-[11px] leading-relaxed text-neutral-600">
            已自动缩放至 <b class="font-semibold">{{ Math.round(stats.fitScale * 100) }}%</b> · 共
            {{ stats.pages }} 页
          </p>
          <p
            v-if="stats.overflow > 0"
            class="flex gap-1.5 text-[11px] leading-relaxed text-amber-700"
          >
            <AlertTriangle class="mt-px size-3.5 shrink-0" />
            <span>{{ stats.overflow }} 个条目高于整页高度，已被强制分页。</span>
          </p>
        </div>
      </PopoverContent>
    </Popover>

    <!-- 缩放 -->
    <div class="hidden items-center rounded-md border border-neutral-200 lg:flex">
      <button
        class="flex h-8 w-7 items-center justify-center rounded-l text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        title="缩小"
        @click="zoomOut"
      >
        <ZoomOut class="size-3.5" />
      </button>
      <button
        class="h-8 w-11 border-x border-neutral-200 text-[11.5px] tabular-nums text-neutral-600 transition-colors hover:bg-neutral-100"
        title="重置为 100%"
        @click="zoomActual"
      >
        {{ Math.round(zoom * 100) }}%
      </button>
      <button
        class="flex h-8 w-7 items-center justify-center rounded-r text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        title="放大"
        @click="zoomIn"
      >
        <ZoomIn class="size-3.5" />
      </button>
    </div>

    <!-- 数据 -->
    <Popover>
      <PopoverTrigger as-child>
        <button
          class="flex size-8 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          title="数据管理"
        >
          <FileJson class="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" class="w-56 p-1.5">
        <button
          class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px] text-neutral-700 transition-colors hover:bg-neutral-100"
          @click="exportJson"
        >
          <FileDown class="size-3.5" /> 导出 JSON 备份
        </button>
        <button
          class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px] text-neutral-700 transition-colors hover:bg-neutral-100"
          @click="fileInput?.click()"
        >
          <Upload class="size-3.5" /> 导入 JSON
        </button>
        <div class="my-1 h-px bg-neutral-200" />
        <button
          class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px] text-neutral-700 transition-colors hover:bg-neutral-100"
          @click="startBlank"
        >
          <FilePlus2 class="size-3.5" /> 新建空白简历
        </button>
        <button
          class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px] text-neutral-700 transition-colors hover:bg-neutral-100"
          @click="loadSample"
        >
          <RefreshCcw class="size-3.5" /> 载入示例内容
        </button>
        <input
          ref="fileInput"
          type="file"
          accept="application/json,.json"
          class="hidden"
          @change="importJson"
        />
      </PopoverContent>
    </Popover>

    <!-- 导出 -->
    <Button size="sm" class="h-8 px-3" @click="exportOpen = true"> 导出 PDF </Button>
  </header>
</template>
