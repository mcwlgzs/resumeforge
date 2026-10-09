/** 颜色工具：把 #rgb / #rrggbb 转成 rgba()，避免导出时依赖 color-mix() */

export function normalizeHex(input: string): string {
  let hex = (input || '').trim()
  if (!hex.startsWith('#')) hex = `#${hex}`
  if (/^#[0-9a-f]{3}$/i.test(hex)) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
  }
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return '#2563eb'
  return hex.toLowerCase()
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = normalizeHex(hex)
  return {
    r: parseInt(h.slice(1, 3), 16),
    g: parseInt(h.slice(3, 5), 16),
    b: parseInt(h.slice(5, 7), 16),
  }
}

export function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${Math.round(alpha * 1000) / 1000})`
}

/** 与白色混合（用于浅色底） */
export function mixWithWhite(hex: string, ratio: number): string {
  const { r, g, b } = hexToRgb(hex)
  const mix = (c: number) => Math.round(c + (255 - c) * (1 - ratio))
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`
}

/** 判断颜色明暗，返回是否偏暗 */
export function isDark(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex)
  return (r * 299 + g * 587 + b * 114) / 1000 < 140
}

export function readableOn(hex: string): string {
  return isDark(hex) ? '#ffffff' : '#1a1a1a'
}
