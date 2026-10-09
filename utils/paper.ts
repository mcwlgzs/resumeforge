/* ------------------------------------------------------------------
 * 纸张规格
 * 尺寸单位：毫米（纵向基准宽 × 高）
 * ------------------------------------------------------------------ */

export interface PaperSize {
  key: string
  label: string
  /** 中文备注 */
  note: string
  /** 纵向：宽 x 高 (mm) */
  width: number
  height: number
  /** 分组 */
  group: 'ISO 216' | '北美' | '中国标准' | '屏幕'
}

export const PAPER_SIZES: PaperSize[] = [
  {
    key: 'a4',
    label: 'A4',
    note: '210 × 297 mm · 国际通用',
    width: 210,
    height: 297,
    group: 'ISO 216',
  },
  {
    key: 'a3',
    label: 'A3',
    note: '297 × 420 mm · 大幅作品集',
    width: 297,
    height: 420,
    group: 'ISO 216',
  },
  {
    key: 'a5',
    label: 'A5',
    note: '148 × 210 mm · 迷你简历',
    width: 148,
    height: 210,
    group: 'ISO 216',
  },
  { key: 'b5', label: 'B5', note: '176 × 250 mm', width: 176, height: 250, group: 'ISO 216' },
  { key: 'b4', label: 'B4', note: '250 × 353 mm', width: 250, height: 353, group: 'ISO 216' },

  {
    key: 'letter',
    label: 'Letter',
    note: '8.5 × 11 in · 美国/加拿大',
    width: 215.9,
    height: 279.4,
    group: '北美',
  },
  {
    key: 'legal',
    label: 'Legal',
    note: '8.5 × 14 in · 长版',
    width: 215.9,
    height: 355.6,
    group: '北美',
  },
  {
    key: 'tabloid',
    label: 'Tabloid',
    note: '11 × 17 in',
    width: 279.4,
    height: 431.8,
    group: '北美',
  },
  {
    key: 'executive',
    label: 'Executive',
    note: '7.25 × 10.5 in',
    width: 184.15,
    height: 266.7,
    group: '北美',
  },

  {
    key: 'cn16k',
    label: '16开',
    note: '185 × 260 mm · 国内打印店常用',
    width: 185,
    height: 260,
    group: '中国标准',
  },
  { key: 'cn32k', label: '32开', note: '130 × 184 mm', width: 130, height: 184, group: '中国标准' },
  {
    key: 'cn-a4',
    label: '大16开',
    note: '210 × 285 mm',
    width: 210,
    height: 285,
    group: '中国标准',
  },

  {
    key: 'slide169',
    label: '幻灯片 16:9',
    note: '338 × 190 mm · 屏幕演示',
    width: 338.7,
    height: 190.5,
    group: '屏幕',
  },
  {
    key: 'slide43',
    label: '幻灯片 4:3',
    note: '254 × 190 mm · 屏幕演示',
    width: 254,
    height: 190.5,
    group: '屏幕',
  },
]

export const PAPER_MAP: Record<string, PaperSize> = Object.fromEntries(
  PAPER_SIZES.map((p) => [p.key, p]),
)

/** 预览用换算：CSS 参考 96dpi */
export const MM_TO_PX = 96 / 25.4 // 3.779527559…

/** 设计稿缩放上限（预览时 1mm 用多少 px） */
export const PREVIEW_SCALE_DEFAULT = MM_TO_PX

export function paperDimensions(paperKey: string, orientation: 'portrait' | 'landscape') {
  const p = PAPER_MAP[paperKey] ?? PAPER_MAP.a4
  const w = orientation === 'landscape' ? p.height : p.width
  const h = orientation === 'landscape' ? p.width : p.height
  return { width: w, height: h, def: p }
}

/** 1pt = 1/72 inch；转 px（按 96dpi） */
export function ptToPx(pt: number) {
  return (pt * 96) / 72
}

export function mmToPx(mm: number) {
  return mm * MM_TO_PX
}

export function pxToMm(px: number) {
  return px / MM_TO_PX
}
