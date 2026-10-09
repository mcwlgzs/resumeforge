import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas-pro'
import { paperDimensions } from '~/utils/paper'

export interface ExportOptions {
  filename?: string
  /** 输出分辨率（DPI），96 为屏幕基准 */
  dpi?: number
  /** 图片编码：jpeg 体积小、png 无损 */
  format?: 'jpeg' | 'png'
  /** jpeg 质量 0~1 */
  quality?: number
  /** 纸张（用于 PDF 页面尺寸） */
  paperKey: string
  orientation: 'portrait' | 'landscape'
  /** 只导出指定页（1-based），缺省全部 */
  pages?: number[]
  /** 附加 PDF 元信息 */
  meta?: { title?: string; author?: string; subject?: string; keywords?: string }
}

/** 页面之间的等待，让浏览器有机会重绘 / 更新进度条 */
function nextFrame() {
  return new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  )
}

export function usePdfExport() {
  const busy = ref(false)
  const progress = ref(0)
  const status = ref('')

  /** 收集预览区真实渲染出的页面元素 */
  function collectPages(): HTMLElement[] {
    const root = document.querySelector<HTMLElement>('[data-preview-pages]')
    if (!root) return []
    return Array.from(root.querySelectorAll<HTMLElement>('.page'))
  }

  /** 导出期间临时取消预览缩放，保证截图按 1:1 物理尺寸进行 */
  async function withNeutralZoom<T>(fn: () => Promise<T>): Promise<T> {
    const inner = document.querySelector<HTMLElement>('[data-preview-inner]')
    const prev = inner?.style.transform ?? ''
    const prevOrigin = inner?.style.transformOrigin ?? ''
    if (inner) {
      inner.style.transform = 'none'
      inner.style.transformOrigin = 'top left'
    }
    document.body.classList.add('exporting')
    await nextFrame()
    try {
      return await fn()
    } finally {
      if (inner) {
        inner.style.transform = prev
        inner.style.transformOrigin = prevOrigin
      }
      document.body.classList.remove('exporting')
      await nextFrame()
    }
  }

  async function exportPdf(opts: ExportOptions) {
    if (busy.value) return null
    const {
      paperKey,
      orientation,
      dpi = 200,
      format = 'jpeg',
      quality = 0.94,
      filename = 'resume.pdf',
      meta = {},
    } = opts

    const all = collectPages()
    const targets = opts.pages?.length ? opts.pages.map((n) => all[n - 1]).filter(Boolean) : all
    if (!targets.length) throw new Error('没有可导出的页面')

    const { width: pw, height: ph } = paperDimensions(paperKey, orientation)
    const scale = dpi / 96

    busy.value = true
    progress.value = 0
    status.value = '准备中…'

    try {
      return await withNeutralZoom(async () => {
        const pdf = new jsPDF({
          unit: 'mm',
          format: [pw, ph],
          orientation: pw > ph ? 'landscape' : 'portrait',
          compress: true,
        })

        for (let i = 0; i < targets.length; i++) {
          status.value = `正在渲染第 ${i + 1} / ${targets.length} 页…`
          progress.value = (i / targets.length) * 0.9

          const canvas = await html2canvas(targets[i], {
            scale,
            backgroundColor: '#ffffff',
            useCORS: true,
            allowTaint: false,
            logging: false,
            windowWidth: targets[i].scrollWidth,
            windowHeight: targets[i].scrollHeight,
          })

          const data =
            format === 'png'
              ? canvas.toDataURL('image/png')
              : canvas.toDataURL('image/jpeg', quality)

          if (i > 0) pdf.addPage([pw, ph], pw > ph ? 'landscape' : 'portrait')
          pdf.addImage(data, format === 'png' ? 'PNG' : 'JPEG', 0, 0, pw, ph, undefined, 'FAST')

          progress.value = ((i + 1) / targets.length) * 0.9
          await nextFrame()
        }

        status.value = '生成 PDF…'
        pdf.setProperties({
          title: meta.title || '个人简历',
          author: meta.author || '',
          subject: meta.subject || '简历',
          keywords: meta.keywords || '',
          creator: 'ResumeForge',
        })

        const blob = pdf.output('blob')
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
        document.body.appendChild(a)
        a.click()
        a.remove()
        setTimeout(() => URL.revokeObjectURL(url), 4000)

        progress.value = 1
        status.value = '完成'
        return blob
      })
    } finally {
      busy.value = false
      setTimeout(() => {
        status.value = ''
        progress.value = 0
      }, 1200)
    }
  }

  /**
   * 备选路径：走浏览器打印管线，产出「文字可搜索、矢量清晰」的 PDF。
   * 代价是依赖用户在打印对话框里选择「另存为 PDF」。
   */
  async function printResume(paperKey: string, orientation: 'portrait' | 'landscape') {
    const { width, height } = paperDimensions(paperKey, orientation)

    const style = document.createElement('style')
    style.id = 'rf-print-page'
    style.textContent = `@page { size: ${width}mm ${height}mm; margin: 0; }`

    const layout = document.createElement('style')
    layout.id = 'rf-print-layout'
    layout.textContent = `
      @media print {
        html, body { background: #fff !important; }
        body * { visibility: hidden !important; }
        [data-preview-pages], [data-preview-pages] * { visibility: visible !important; }
        [data-preview-pages] {
          position: absolute !important;
          left: 0 !important; top: 0 !important;
          margin: 0 !important; padding: 0 !important;
          transform: none !important;
        }
        [data-preview-inner] { transform: none !important; gap: 0 !important; }
        [data-preview-pages] .page {
          box-shadow: none !important;
          border-radius: 0 !important;
          break-inside: avoid;
          page-break-after: always;
        }
        [data-preview-pages] .page:last-child { page-break-after: auto; }
        .no-export, .no-print { display: none !important; }
      }
    `

    const inner = document.querySelector<HTMLElement>('[data-preview-inner]')
    const prev = inner?.style.transform ?? ''
    const prevGap = inner?.style.gap ?? ''
    if (inner) {
      inner.style.transform = 'none'
      inner.style.gap = '0px'
    }

    document.head.appendChild(style)
    document.head.appendChild(layout)

    const cleanup = () => {
      style.remove()
      layout.remove()
      if (inner) {
        inner.style.transform = prev
        inner.style.gap = prevGap
      }
      window.removeEventListener('afterprint', cleanup)
    }
    window.addEventListener('afterprint', cleanup)

    await nextFrame()
    window.print()
    // 某些浏览器不触发 afterprint，兜底清理
    setTimeout(cleanup, 60000)
  }

  return { busy, progress, status, exportPdf, printResume }
}
