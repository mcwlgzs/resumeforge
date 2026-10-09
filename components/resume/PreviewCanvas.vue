<script setup lang="ts">
import type { FitMode, ResumeData } from '~/types/resume'
import {
  computeBreaks,
  fitToHeight,
  flush,
  measureBlocks,
  waitForFonts,
} from '~/composables/usePagination'
import { mmToPx, paperDimensions } from '~/utils/paper'

const props = withDefaults(
  defineProps<{
    data: ResumeData
    fitMode?: FitMode
    zoom?: number
    /** 页面间距（px，未缩放） */
    gap?: number
  }>(),
  { fitMode: 'shrink', zoom: 1, gap: 24 },
)

const emit = defineEmits<{
  (e: 'stats', s: { pages: number; fitScale: number; overflow: number; fillRatio: number }): void
}>()

const measureWrap = ref<HTMLElement | null>(null)

const fitScale = ref(1)
const mainOffsets = ref<number[]>([0])
const sideOffsets = ref<number[]>([0])
const overflowCount = ref(0)
const fillRatio = ref(0)
const ready = ref(false)

const design = computed(() => props.data.design)
const paper = computed(() => paperDimensions(design.value.paper, design.value.orientation))
const pageW = computed(() => mmToPx(paper.value.width))
const pageH = computed(() => mmToPx(paper.value.height))
const pad = computed(() => ({
  top: mmToPx(design.value.margins.top),
  right: mmToPx(design.value.margins.right),
  bottom: mmToPx(design.value.margins.bottom),
  left: mmToPx(design.value.margins.left),
}))
const contentW = computed(() => Math.max(pageW.value - pad.value.left - pad.value.right, 80))
const contentH = computed(() => Math.max(pageH.value - pad.value.top - pad.value.bottom, 80))

const pageCount = computed(() => Math.max(mainOffsets.value.length, sideOffsets.value.length, 1))

const stageH = computed(() => pageCount.value * pageH.value + (pageCount.value - 1) * props.gap)

/* ------------------------------------------------------------------
 * 测量
 * ------------------------------------------------------------------ */
function contentExtent(colEl: HTMLElement) {
  const blocks = measureBlocks(colEl)
  if (!blocks.length) return 0
  return Math.max(...blocks.map((b) => b.top + b.height))
}

/** 列自身的上下内边距不提供排版空间，必须从可用高度中扣除 */
function innerAvail(colEl: HTMLElement | null, base: number) {
  if (!colEl) return base
  const cs = getComputedStyle(colEl)
  const pt = parseFloat(cs.paddingTop) || 0
  const pb = parseFloat(cs.paddingBottom) || 0
  return Math.max(base - pt - pb, 40)
}

function measureAll() {
  const wrap = measureWrap.value
  if (!wrap) return
  const body = wrap.querySelector<HTMLElement>('[data-resume-body]')
  const mainCol = wrap.querySelector<HTMLElement>('[data-column="main"]')
  const sideCol = wrap.querySelector<HTMLElement>('[data-column="side"]')
  const headerEl = wrap.querySelector<HTMLElement>('.rs-header-block')
  if (!body || !mainCol) return

  const baseFontPx = (design.value.baseFontSize * 96) / 72
  const applyScale = (s: number) => {
    body.style.fontSize = `${baseFontPx * s}px`
    flush(body)
  }

  const avail = contentH.value

  const extent = () => {
    const hh =
      headerEl && headerEl.offsetParent !== null ? headerEl.getBoundingClientRect().height : 0
    const mh = contentExtent(mainCol)
    const sh = sideCol ? contentExtent(sideCol) : 0
    return hh + Math.max(mh, sh)
  }

  // ---- 智能一页 ----
  const scale = fitToHeight(avail, {
    mode: props.fitMode === 'off' ? 'off' : props.fitMode,
    measure: extent,
    applyScale,
    minScale: 0.6,
    maxScale: 1.4,
  })
  applyScale(scale)
  if (scale !== fitScale.value) fitScale.value = scale

  // ---- 分页 ----
  const headerH = headerEl ? headerEl.getBoundingClientRect().height : 0
  const firstBase = Math.max(avail - headerH, 40)

  const mainRes = computeBreaks(measureBlocks(mainCol), {
    firstAvail: innerAvail(mainCol, firstBase),
    restAvail: innerAvail(mainCol, avail),
  })
  mainOffsets.value = mainRes.offsets

  if (sideCol) {
    const sideRes = computeBreaks(measureBlocks(sideCol), {
      firstAvail: innerAvail(sideCol, firstBase),
      restAvail: innerAvail(sideCol, avail),
    })
    sideOffsets.value = sideRes.offsets
    overflowCount.value = mainRes.overflowBlocks + sideRes.overflowBlocks
  } else {
    sideOffsets.value = [0]
    overflowCount.value = mainRes.overflowBlocks
  }

  const total = extent()
  fillRatio.value = avail > 0 ? Math.min(total / avail, 1.4) : 1

  ready.value = true
  emit('stats', {
    pages: Math.max(mainOffsets.value.length, sideOffsets.value.length, 1),
    fitScale: scale,
    overflow: overflowCount.value,
    fillRatio: fillRatio.value,
  })
}

/* ------------------------------------------------------------------
 * 调度：合并高频变更
 * ------------------------------------------------------------------ */
let raf = 0
let timer: ReturnType<typeof setTimeout> | null = null

async function schedule(delay = 60) {
  if (!import.meta.client) return
  if (timer) clearTimeout(timer)
  timer = setTimeout(async () => {
    await nextTick()
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      try {
        measureAll()
      } catch {
        /* 忽略单次测量异常，下一轮会重试 */
      }
    })
  }, delay)
}

onMounted(async () => {
  await waitForFonts()
  await schedule(0)
})

watch(
  () => [props.data, props.fitMode],
  () => {
    fitScale.value = 1
    schedule(70)
  },
  { deep: true },
)

defineExpose({ remeasure: () => schedule(0) })

const stageStyle = computed(() => ({
  width: `${pageW.value * props.zoom}px`,
  height: `${stageH.value * props.zoom}px`,
}))

const innerStyle = computed(() => ({
  width: `${pageW.value}px`,
  transform: `scale(${props.zoom})`,
  transformOrigin: 'top left',
  gap: `${props.gap}px`,
}))

const pageStyle = computed(() => ({
  width: `${pageW.value}px`,
  height: `${pageH.value}px`,
}))

const padStyle = computed(() => ({
  top: `${pad.value.top}px`,
  right: `${pad.value.right}px`,
  bottom: `${pad.value.bottom}px`,
  left: `${pad.value.left}px`,
}))
</script>

<template>
  <div class="relative">
    <!-- 测量副本：脱离布局，不影响滚动条 -->
    <div
      ref="measureWrap"
      aria-hidden="true"
      class="pointer-events-none fixed top-0 left-[-20000px] opacity-0"
      :style="{ width: `${contentW}px` }"
    >
      <ResumeBody :data="data" :fit-scale="fitScale" :clip="false" :show-header="true" />
    </div>

    <!-- 舞台 -->
    <div class="relative" :style="stageStyle" data-preview-pages>
      <div class="flex flex-col absolute top-0 left-0" :style="innerStyle" data-preview-inner>
        <div
          v-for="i in pageCount"
          :key="i"
          class="page relative bg-white paper-shadow overflow-hidden"
          :style="pageStyle"
        >
          <div class="absolute" :style="padStyle">
            <ResumeBody
              :data="data"
              :fit-scale="fitScale"
              :shift-main="mainOffsets[i - 1] ?? 0"
              :shift-side="sideOffsets[i - 1] ?? 0"
              :show-header="i === 1"
              :clip="true"
              :avail-height="contentH"
              :hide-main="i - 1 >= mainOffsets.length"
              :hide-side="i - 1 >= sideOffsets.length"
            />
          </div>

          <!-- 分页提示线（仅编辑态） -->
          <div
            v-if="i < pageCount"
            class="no-export pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center"
          >
            <div class="flex-1 border-b border-dashed border-rose-400/70" />
            <span
              class="rounded-l bg-rose-500 px-1.5 py-0.5 text-[9px] font-medium tracking-wide text-white"
              >分页</span
            >
          </div>

          <span
            class="no-export pointer-events-none absolute right-2 bottom-1.5 text-[10px] tabular-nums text-black/25"
            >{{ i }} / {{ pageCount }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
