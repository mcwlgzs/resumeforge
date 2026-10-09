export interface FontOption {
  key: string
  label: string
  stack: string
  note?: string
}

export const FONT_OPTIONS: FontOption[] = [
  {
    key: 'sans',
    label: '现代无衬线',
    stack: "'Inter', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    note: '互联网 / 技术岗推荐',
  },
  {
    key: 'serif',
    label: '衬线宋体',
    stack: "'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', 'SimSun', serif",
    note: '学术 / 出版 / 传统行业',
  },
  {
    key: 'hei',
    label: '黑体',
    stack: "'PingFang SC', 'HarmonyOS Sans SC', 'Microsoft YaHei', 'Heiti SC', sans-serif",
    note: '国内企业通用',
  },
  {
    key: 'song',
    label: '书宋',
    stack: "'Source Han Serif SC', 'Songti SC', 'SimSun', 'STSong', serif",
    note: '公文 / 体制内',
  },
  {
    key: 'kai',
    label: '楷体',
    stack: "'KaiTi', 'STKaiti', 'Kaiti SC', serif",
    note: '正式公函',
  },
  {
    key: 'mono',
    label: '等宽',
    stack: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace",
    note: '工程师风格',
  },
]

export const FONT_MAP: Record<string, FontOption> = Object.fromEntries(
  FONT_OPTIONS.map((f) => [f.key, f]),
)

export function fontStack(key: string) {
  return FONT_MAP[key]?.stack ?? FONT_MAP.sans.stack
}

/* ------------------------------------------------------------------
 * 模板元数据
 * ------------------------------------------------------------------ */
export interface TemplateMeta {
  key: string
  label: string
  desc: string
  /** 主色 */
  accent: string
  /** 是否双栏 */
  columns: 1 | 2
  /** 页眉风格 */
  header: 'classic' | 'center' | 'banner' | 'side'
  /** 标题风格 */
  heading: 'plain' | 'underline' | 'bar' | 'boxed' | 'dot'
  /** 推荐字号 pt */
  fontSize: number
  lineHeight: number
  fontFamily: string
}

export const TEMPLATES: TemplateMeta[] = [
  {
    key: 'classic',
    label: '经典单栏',
    desc: '传统稳重，通用性最强，适合绝大多数岗位',
    accent: '#1f2937',
    columns: 1,
    header: 'classic',
    heading: 'underline',
    fontSize: 10,
    lineHeight: 1.55,
    fontFamily: 'hei',
  },
  {
    key: 'modern',
    label: '现代色带',
    desc: '顶部强调色横幅，视觉冲击强，适合产品 / 设计岗',
    accent: '#4f46e5',
    columns: 1,
    header: 'banner',
    heading: 'bar',
    fontSize: 10,
    lineHeight: 1.55,
    fontFamily: 'sans',
  },
  {
    key: 'sidebar',
    label: '左侧栏',
    desc: '双栏布局，信息密度高，适合技能丰富的资深从业者',
    accent: '#0f766e',
    columns: 2,
    header: 'side',
    heading: 'bar',
    fontSize: 9.6,
    lineHeight: 1.5,
    fontFamily: 'sans',
  },
  {
    key: 'minimal',
    label: '极简居中',
    desc: '大量留白，克制而有格调，适合咨询 / 学术 / 外企',
    accent: '#111827',
    columns: 1,
    header: 'center',
    heading: 'dot',
    fontSize: 9.8,
    lineHeight: 1.6,
    fontFamily: 'serif',
  },
  {
    key: 'compact',
    label: '紧凑双栏',
    desc: '极致压缩，非常适合把内容塞进一页',
    accent: '#b45309',
    columns: 2,
    header: 'classic',
    heading: 'bar',
    fontSize: 9.2,
    lineHeight: 1.42,
    fontFamily: 'hei',
  },
]

export const TEMPLATE_MAP: Record<string, TemplateMeta> = Object.fromEntries(
  TEMPLATES.map((t) => [t.key, t]),
)

/* ------------------------------------------------------------------
 * 主题色预设
 * ------------------------------------------------------------------ */
export const ACCENT_PRESETS = [
  { label: '石墨黑', value: '#1f2937' },
  { label: '靛蓝', value: '#4f46e5' },
  { label: '科技蓝', value: '#2563eb' },
  { label: '青色', value: '#0891b2' },
  { label: '墨绿', value: '#0f766e' },
  { label: '森林绿', value: '#15803d' },
  { label: '琥珀', value: '#b45309' },
  { label: '砖红', value: '#b91c1c' },
  { label: '玫红', value: '#be185d' },
  { label: '紫罗兰', value: '#7c3aed' },
  { label: '石板灰', value: '#475569' },
  { label: '深棕', value: '#78350f' },
]
