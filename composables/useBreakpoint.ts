import { useMediaQuery } from '@vueuse/core'

/**
 * 布局断点。
 * xl(1280+) 采用三栏（内容 / 预览 / 设计）；以下降级为两栏，
 * 设计面板回到左侧 Tab 中，避免挤压预览画布。
 */
export function useBreakpoint() {
  const isWide = useMediaQuery('(min-width: 1280px)')
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  return { isWide, isDesktop }
}
