/* ------------------------------------------------------------------
 * 简历数据模型
 * ------------------------------------------------------------------ */

export type SectionType =
  | 'summary'
  | 'experience'
  | 'projects'
  | 'education'
  | 'skills'
  | 'awards'
  | 'certificates'
  | 'publications'
  | 'languages'
  | 'custom'

export interface ResumeItem {
  id: string
  /** 主标题：职位 / 项目名 / 学校 / 奖项名 */
  title?: string
  /** 副标题：公司 / 角色 / 专业 */
  subtitle?: string
  /** 地点 */
  location?: string
  /** 起止时间（纯文本，如 2021.06） */
  start?: string
  end?: string
  /** 至今 */
  current?: boolean
  /** 段落描述（支持 \n 分段） */
  description?: string
  /** 要点列表 */
  bullets?: string[]
  /** 标签（技能、技术栈） */
  tags?: string[]
  /** 熟练度 1~5，用于技能条 */
  level?: number
  /** 链接 */
  link?: string
  /** 附加信息（右侧小字：GPA、奖项等级等） */
  extra?: string
  /** 显隐 */
  hidden?: boolean
}

export interface ResumeSection {
  id: string
  type: SectionType
  /** 显示标题 */
  title: string
  visible: boolean
  /** 归属栏位（双栏模板使用） */
  column: 'main' | 'side'
  items: ResumeItem[]
}

export interface ResumeBasics {
  name: string
  headline: string
  email: string
  phone: string
  location: string
  website: string
  github: string
  weibo: string
  /** 头像 dataURL */
  avatar: string
  /** 头像形状 */
  avatarShape: 'circle' | 'rounded' | 'square'
  /** 头像在页眉中的位置（仅非居中版式生效） */
  avatarPosition: 'left' | 'right'
  /** 头像尺寸倍率，1 = 默认大小 */
  avatarSize: number
  /** 是否显示头像 */
  showAvatar: boolean
  /** 自定义链接列表 */
  links: { id: string; label: string; value: string }[]
}

export type Orientation = 'portrait' | 'landscape'

export type FitMode = 'off' | 'shrink' | 'stretch'

export interface ResumeDesign {
  paper: string
  orientation: Orientation
  margins: { top: number; right: number; bottom: number; left: number }
  template: string
  accent: string
  /** 基准字号（pt，1~14） */
  baseFontSize: number
  /** 行高倍率 */
  lineHeight: number
  /** 段间距倍率 */
  sectionGap: number
  /** 字体族 key */
  fontFamily: string
  /** 标题风格 */
  headingStyle: 'plain' | 'underline' | 'bar' | 'boxed' | 'dot'
  /** 分栏比例（双栏模板） */
  sideWidth: number
  /** 是否在页眉显示联系方式整块 */
  showContacts: boolean
  /** 联系方式前是否显示图标 */
  showIcons: boolean
  /** 是否显示分割线 */
  showDividers: boolean
}

export interface ResumeData {
  basics: ResumeBasics
  sections: ResumeSection[]
  design: ResumeDesign
}

/* ------------------------------------------------------------------
 * 默认值
 * ------------------------------------------------------------------ */

export const DEFAULT_DESIGN: ResumeDesign = {
  paper: 'a4',
  orientation: 'portrait',
  margins: { top: 14, right: 14, bottom: 14, left: 14 },
  template: 'classic',
  accent: '#2563eb',
  baseFontSize: 10,
  lineHeight: 1.5,
  sectionGap: 1,
  fontFamily: 'sans',
  headingStyle: 'bar',
  sideWidth: 34,
  showContacts: true,
  /* 联系方式默认走纯文字，不加前置图标 */
  showIcons: false,
  showDividers: false,
}
