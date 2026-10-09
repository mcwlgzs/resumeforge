<script setup lang="ts">
import { Maximize2, Minus, MoveHorizontal, Plus, Ruler } from 'lucide-vue-next'
import { useEventListener } from '@vueuse/core'
import { mmToPx, paperDimensions, PAPER_SIZES } from '~/utils/paper'

const { resume } = useResume()
const { zoom, zoomIn, zoomOut, zoomActual, autoFit, fitMode, stats } = useEditor()

const canvas = ref<InstanceType<any> | null>(null)
const scroller = ref<HTMLElement | null>(null)

function onStats(s: any) {
  stats.value = s
}

const paperLabel = computed(
  () => PAPER_SIZES.find((p) => p.key === resume.value.design.paper)?.label ?? 'A4',
)

/** 当前纸张的物理像素尺寸（96dpi） */
const pagePx = computed(() => {
  const d = paperDimensions(resume.value.design.paper, resume.value.design.orientation)
  return { w: mmToPx(d.width), h: mmToPx(d.height) }
})

/** 画布内边距，对应下方容器的 p-7 */
const VIEW_PAD = 56

function setZoom(raw: number) {
  zoom.value = Math.max(0.15, Math.min(1.2, Math.round(raw * 100) / 100))
}

/** 整页：让一整页完整落在画布内 —— 打开时的默认视图 */
function fitPage() {
  const el = scroller.value
  if (!el || !pagePx.value.w) return
  const aw = el.clientWidth - VIEW_PAD
  const ah = el.clientHeight - VIEW_PAD
  setZoom(Math.min(aw / pagePx.value.w, ah / pagePx.value.h))
  autoFit.value = 'page'
}

/** 宽度：占满横向，纵向滚动细看 */
function fitWidth() {
  const el = scroller.value
  if (!el || !pagePx.value.w) return
  const aw = el.clientWidth - VIEW_PAD
  setZoom(Math.min(aw / pagePx.value.w, 0.98))
  autoFit.value = 'width'
}

function applyAutoFit() {
  if (autoFit.value === 'page') fitPage()
  else if (autoFit.value === 'width') fitWidth()
}

onMounted(async () => {
  await nextTick()
  // 默认整页可见，而不是放大到需要滚动
  fitPage()
})

// 换纸张 / 换方向后重算
watch(
  () => [resume.value.design.paper, resume.value.design.orientation],
  () => nextTick(applyAutoFit),
)

// 窗口尺寸变化时保持当前适配方式
useEventListener(window, 'resize', () => applyAutoFit())

// Ctrl/Cmd + 0 整页，Ctrl/Cmd + 1 实际大小
useEventListener(window, 'keydown', (e: KeyboardEvent) => {
  if (!(e.ctrlKey || e.metaKey) || e.altKey) return
  if (e.key === '0') {
    e.preventDefault()
    fitPage()
  } else if (e.key === '1') {
    e.preventDefault()
    zoomActual()
  }
})

defineExpose({ canvas })

const statusTip = computed(() => {
  if (fitMode.value === 'off') return '手动排版'
  if (stats.value.fitScale < 0.985) return `已自动缩放 ${Math.round(stats.value.fitScale * 100)}%`
  if (stats.value.fitScale > 1.015) return `已自动放大 ${Math.round(stats.value.fitScale * 100)}%`
  return '尺寸合适'
})

const zoomTip = computed(() =>
  autoFit.value === 'page' ? '整页视图' : autoFit.value === 'width' ? '适应宽度' : '自定义缩放',
)
</script>

<template>
  <main class="flex h-full w-full min-w-0 flex-col overflow-hidden bg-[#eceef1]">
    <!-- 工具条 -->
    <div
      class="flex h-11 shrink-0 items-center gap-2 border-b border-neutral-200 bg-white px-3.5 text-[12px] select-none"
    >
      <span class="flex items-center gap-1.5 text-neutral-500">
        <Ruler class="size-3.5" />
        {{ paperLabel }} ·
        {{ resume.design.orientation === 'portrait' ? '纵向' : '横向' }}
      </span>
      <span class="h-4 w-px bg-neutral-200" />
      <span
        class="flex items-center gap-1.5"
        :class="stats.pages > 1 ? 'text-rose-600' : 'text-emerald-600'"
      >
        <span class="size-1.5 rounded-full bg-current" />
        {{ stats.pages }} 页
      </span>
      <span class="hidden text-neutral-400 xl:inline">{{ statusTip }}</span>

      <div class="flex-1" />

      <!-- 视图适配：一键看到整页 -->
      <div class="flex items-center gap-0.5 rounded-md border border-neutral-200 p-0.5">
        <button
          class="flex h-6 items-center gap-1 rounded px-1.5 text-[11.5px] transition-colors"
          :class="
            autoFit === 'page'
              ? 'bg-brand-soft text-brand font-medium'
              : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
          "
          title="缩放至整页完整可见"
          @click="fitPage"
        >
          <Maximize2 class="size-3" />
          整页
        </button>
        <button
          class="flex h-6 items-center gap-1 rounded px-1.5 text-[11.5px] transition-colors"
          :class="
            autoFit === 'width'
              ? 'bg-brand-soft text-brand font-medium'
              : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
          "
          title="缩放至充满画布宽度"
          @click="fitWidth"
        >
          <MoveHorizontal class="size-3" />
          宽度
        </button>
      </div>

      <!-- 缩放 -->
      <div class="flex items-center gap-0.5 rounded-md border border-neutral-200 p-0.5">
        <button
          class="flex size-6 items-center justify-center rounded text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          title="缩小"
          @click="zoomOut"
        >
          <Minus class="size-3" />
        </button>
        <button
          class="h-6 w-11 rounded text-center text-[11.5px] tabular-nums text-neutral-600 transition-colors hover:bg-neutral-100"
          :title="`${zoomTip} · 点击恢复 100%`"
          @click="zoomActual"
        >
          {{ Math.round(zoom * 100) }}%
        </button>
        <button
          class="flex size-6 items-center justify-center rounded text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          title="放大"
          @click="zoomIn"
        >
          <Plus class="size-3" />
        </button>
      </div>
    </div>

    <!-- 画布 -->
    <div ref="scroller" class="min-h-0 flex-1 overflow-auto scrollbar-slim">
      <div class="flex min-h-full w-full justify-center p-7">
        <PreviewCanvas
          ref="canvas"
          :data="resume"
          :fit-mode="fitMode"
          :zoom="zoom"
          @stats="onStats"
        />
      </div>
    </div>
  </main>
</template>
