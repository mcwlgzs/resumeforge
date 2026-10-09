/* ------------------------------------------------------------------
 * 分页内核
 *
 * 思路：
 *  1. 模板把「不可分割的最小单元」标记为 [data-block]（一个条目、一个标题…）
 *  2. 读取每个块相对列顶部的几何信息（top / height）
 *  3. 贪心装箱：按可用高度切页，尊重 keep-with-next（标题不与正文分离）
 *  4. 输出每页的内容偏移量，渲染层用 translateY(-offset) 做出「窗口」效果
 * ------------------------------------------------------------------ */

import { clamp } from '../lib/utils.ts'

export interface BlockMetric {
  top: number
  height: number
  /** 必须与下一块同页 */
  keep: boolean
}

export interface BreakResult {
  /** 每页内容向上平移的像素量，长度 = 页数 */
  offsets: number[]
  /** 内容总高度 */
  contentHeight: number
  /** 溢出（单块高于整页）的块数量 */
  overflowBlocks: number
}

/** 读取列内所有 [data-block] 的几何信息 */
export function measureBlocks(columnEl: HTMLElement): BlockMetric[] {
  const columnTop = columnEl.getBoundingClientRect().top
  const nodes = Array.from(columnEl.querySelectorAll<HTMLElement>('[data-block]'))
  return nodes.map((el) => {
    const rect = el.getBoundingClientRect()
    return {
      top: rect.top - columnTop,
      height: rect.height,
      keep: el.dataset.keep === '1',
    }
  })
}

export interface BreakOptions {
  /** 首页可用高度（可能因页眉占用而更小） */
  firstAvail: number
  /** 后续页可用高度 */
  restAvail: number
  /** 内容实际高度（用于判断是否溢出；缺省取块几何的极值） */
  contentHeight?: number
}

export function computeBreaks(blocks: BlockMetric[], opts: BreakOptions): BreakResult {
  const visible = blocks.filter((b) => b.height > 0.5)

  if (!visible.length) {
    return { offsets: [0], contentHeight: opts.contentHeight ?? 0, overflowBlocks: 0 }
  }

  const contentHeight = opts.contentHeight ?? Math.max(...visible.map((b) => b.top + b.height))

  const offsets: number[] = []
  let overflowBlocks = 0
  let i = 0
  let first = true

  while (i < visible.length) {
    const avail = first ? opts.firstAvail : opts.restAvail
    // 首页从列顶（含顶部内边距）开始，后续页从该页首个块的顶部开始
    const pageTop = first ? 0 : visible[i].top

    let cursor = i
    let lastFit = -1

    while (cursor < visible.length) {
      // 一个「原子组」：块本身 + 因 keep 而必须跟随的后续块
      let groupEnd = cursor
      while (groupEnd < visible.length - 1 && visible[groupEnd].keep) groupEnd++

      const groupBottom = visible[groupEnd].top + visible[groupEnd].height
      if (groupBottom - pageTop <= avail + 0.5) {
        lastFit = groupEnd
        cursor = groupEnd + 1
      } else {
        break
      }
    }

    if (lastFit >= i) {
      offsets.push(pageTop)
      i = lastFit + 1
    } else {
      // 本页连第一个原子组都容不下
      let groupEnd = i
      while (groupEnd < visible.length - 1 && visible[groupEnd].keep) groupEnd++
      const groupHeight = visible[groupEnd].top + visible[groupEnd].height - visible[i].top

      if (groupHeight > opts.restAvail + 0.5) {
        // 原子组本身就高于一整页：无法整组容纳。
        // 此处放弃 keep 约束、逐块放行，保证内容不被裁掉。
        overflowBlocks++
      }
      // 首页空间不足 / 组高于整页，都先放行首个块，其余顺延到后续页
      offsets.push(pageTop)
      i = i + 1
    }

    first = false

    if (offsets.length > 200) break // 安全阀
  }

  return { offsets, contentHeight, overflowBlocks }
}

/* ------------------------------------------------------------------
 * 智能一页：迭代缩放
 *
 * 字号变化时行高/边距并非严格线性，用 2~4 轮测量迭代收敛。
 * ------------------------------------------------------------------ */
export interface FitOptions {
  /** 'shrink' 仅压缩；'stretch' 允许放大填充；'off' 关闭 */
  mode: 'shrink' | 'stretch' | 'off'
  minScale?: number
  maxScale?: number
  /** 每轮测量回调，需在 layout 生效后返回当前内容高度 */
  measure: () => number
  /** 应用缩放（同步改 CSS 变量 + 强制 reflow） */
  applyScale: (scale: number) => void
  /** 内容高度容差（px），小于该值视为刚好 */
  tolerance?: number
}

export function fitToHeight(availHeight: number, opts: FitOptions): number {
  const { mode, measure, applyScale } = opts
  const min = opts.minScale ?? 0.62
  const max = opts.maxScale ?? 1.45
  const tol = opts.tolerance ?? 2

  if (mode === 'off') {
    applyScale(1)
    return 1
  }

  applyScale(1)
  const baseHeight = measure()

  if (baseHeight <= 0) return 1

  // 内容已能放进一页
  if (baseHeight <= availHeight + tol) {
    if (mode !== 'stretch') return 1
    // 撑满：按比例放大，再迭代修正（不放大超过 max）
    let scale = clamp(availHeight / baseHeight, 1, max)
    for (let i = 0; i < 4; i++) {
      applyScale(scale)
      const h = measure()
      if (h <= 0) break
      const next = clamp((scale * availHeight) / h, 1, max)
      if (Math.abs(next - scale) < 0.005) break
      scale = next
    }
    applyScale(scale)
    return scale
  }

  // 需要压缩
  let scale = clamp(availHeight / baseHeight, min, 1)
  for (let i = 0; i < 6; i++) {
    applyScale(scale)
    const h = measure()
    if (h <= 0) break
    if (h <= availHeight + tol) {
      // 已放下：尝试回补一点，逼近「刚好一页」
      const back = clamp((scale * availHeight) / h, scale, 1)
      if (back - scale > 0.004) {
        applyScale(back)
        const h2 = measure()
        if (h2 <= availHeight + tol) {
          scale = back
          applyScale(scale)
        } else {
          applyScale(scale)
        }
      }
      break
    }
    const next = clamp((scale * availHeight) / h, min, scale)
    if (Math.abs(next - scale) < 0.004) {
      scale = next
      applyScale(scale)
      break
    }
    scale = next
    if (scale <= min) {
      applyScale(scale)
      break
    }
  }

  return scale
}

/** 强制同步 reflow */
export function flush(el?: HTMLElement | null) {
  void (el ?? document.body).offsetHeight
}

/** 等待字体就绪（首屏测量必须） */
export async function waitForFonts() {
  if (!import.meta.client) return
  try {
    await (document as any).fonts?.ready
  } catch {
    /* noop */
  }
}
