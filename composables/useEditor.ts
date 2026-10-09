import type { FitMode } from '~/types/resume'

export interface PreviewStats {
  pages: number
  fitScale: number
  overflow: number
  fillRatio: number
}

/**
 * 画布自动适配模式。
 * - 'page' 整页可见（默认，简历工具打开就该看到完整一页）
 * - 'width' 充满画布宽度，纵向滚动
 * - null   用户手动缩放后脱离自动适配
 */
export type AutoFit = 'page' | 'width' | null

function clampZoom(v: number) {
  return Math.min(2, Math.max(0.15, Math.round(v * 100) / 100))
}

export function useEditor() {
  const zoom = useState('ed:zoom', () => 0.8)
  const autoFit = useState<AutoFit>('ed:autofit', () => 'page')
  const fitMode = useState<FitMode>('ed:fit-mode', () => 'shrink')
  const activeTab = useState<string>('ed:tab', () => 'content')
  const expandedId = useState<string>('ed:expanded', () => '')
  /** 模块卡片的展开状态，跨组件共享（模块被删除后自然失效） */
  const openSections = useState<Record<string, boolean>>('ed:open-sections', () => ({}))
  const stats = useState<PreviewStats>('ed:stats', () => ({
    pages: 1,
    fitScale: 1,
    overflow: 0,
    fillRatio: 1,
  }))
  const exportOpen = useState('ed:export-open', () => false)
  const exporting = useState('ed:exporting', () => false)

  function toggleSection(id: string, force?: boolean) {
    const next = force ?? !openSections.value[id]
    openSections.value = { ...openSections.value, [id]: next }
  }

  /** 以下三个都是手动缩放，会脱离自动适配 */
  function zoomIn() {
    autoFit.value = null
    zoom.value = clampZoom(zoom.value + 0.08)
  }
  function zoomOut() {
    autoFit.value = null
    zoom.value = clampZoom(zoom.value - 0.08)
  }
  function zoomActual() {
    autoFit.value = null
    zoom.value = 1
  }

  return {
    zoom,
    autoFit,
    fitMode,
    activeTab,
    expandedId,
    openSections,
    stats,
    exportOpen,
    exporting,
    toggleSection,
    zoomIn,
    zoomOut,
    zoomActual,
  }
}
