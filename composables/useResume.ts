import type { ResumeData, ResumeItem, ResumeSection, SectionType } from '~/types/resume'
import { DEFAULT_DESIGN } from '~/types/resume'

const SECTION_PRESETS: Record<SectionType, { title: string; make: () => ResumeItem[] }> = {
  summary: {
    title: '个人简介',
    make: () => [
      {
        id: uid('it'),
        description:
          '5 年前端开发经验，专注 Vue / Nuxt 生态与工程化建设，主导过 3 个百万级 DAU 产品的性能优化，首屏耗时平均降低 46%。习惯用数据驱动决策，乐于沉淀工具链与规范。',
      },
    ],
  },
  experience: {
    title: '工作经历',
    make: () => [
      {
        id: uid('it'),
        title: '高级前端工程师',
        subtitle: '某某科技有限公司',
        location: '上海',
        start: '2022.03',
        end: '',
        current: true,
        bullets: [
          '主导核心 SaaS 控制台从 Vue 2 迁移至 Nuxt 3 + TypeScript，构建产物体积下降 38%，冷启动耗时缩短 52%',
          '搭建前端监控与埋点体系，线上异常平均发现时间由小时级压缩至 3 分钟内，MTTR 下降约 65%',
          '主导设计系统落地，沉淀 60+ 业务组件，需求平均交付周期缩短 25%，新人上手成本明显下降',
          '推动性能预算机制，把 LCP、CLS 纳入 CI 门禁，核心页面性能回归问题实现零逃逸',
          '牵头前端技术分享与 Code Review 机制，团队人均需求吞吐量提升约 20%',
        ],
      },
      {
        id: uid('it'),
        title: '前端工程师',
        subtitle: '某某网络技术有限公司',
        location: '杭州',
        start: '2020.07',
        end: '2022.02',
        bullets: [
          '独立完成营销活动搭建平台，支持拖拽式页面生成，累计产出活动页 400+，运营提效约 60%',
          '推动单元测试与 CI 落地，核心模块覆盖率由 0 提升至 82%，发版回滚率下降 70%',
          '负责小程序端性能优化，通过分包与资源预加载把首屏时间从 2.4s 优化至 1.1s',
          '沉淀活动页模板与低代码组件，把常规活动的开发周期从 3 天压缩到 4 小时',
        ],
      },
    ],
  },
  projects: {
    title: '项目经历',
    make: () => [
      {
        id: uid('it'),
        title: 'ResumeForge 在线简历工具',
        subtitle: '个人开源项目 · 技术负责人',
        start: '2024.05',
        end: '',
        current: true,
        description: '面向求职者的可视化简历编辑器，支持智能一页排版与多尺寸纸张导出。',
        bullets: [
          '设计「内容块测量 + 贪心装箱」的分页内核，实现真实多页排版，而非把长图生硬切块',
          '用迭代测量算法把字号自动收敛到「刚好一页」，解决求职者反复手调字号的核心痛点',
          '基于 SnapDOM / canvas + jsPDF 实现最高 300 DPI 的高保真导出，并提供矢量打印通道',
          '内置内容体检规则，对要点过长、模块空置、缺联系方式等给出可执行的修改建议',
        ],
        tags: ['Nuxt 3', 'TypeScript', 'Tailwind CSS', 'shadcn-vue'],
        link: 'https://github.com/',
      },
      {
        id: uid('it'),
        title: '企业级数据可视化平台',
        subtitle: '核心开发',
        start: '2023.03',
        end: '2023.11',
        description: '面向内部运营的实时数据看板，支持 30+ 图表类型与自定义仪表盘编排。',
        bullets: [
          '抽象统一图表渲染层，新增图表接入成本从 2 天降到 2 小时，覆盖 30+ 图表类型',
          '用 Web Worker 承接万级数据点聚合计算，主线程渲染帧率稳定在 55fps 以上',
          '设计看板级联查询与多级缓存策略，接口平均响应时间下降约 40%',
          '推动看板配置化改造，运营自助搭建比例从 20% 提升到 85%，释放前端排期压力',
        ],
        tags: ['Vue 3', 'ECharts', 'Web Worker', 'Vite'],
      },
    ],
  },
  education: {
    title: '教育经历',
    make: () => [
      {
        id: uid('it'),
        title: '软件工程 · 学士',
        subtitle: '某某大学',
        start: '2016.09',
        end: '2020.06',
        extra: 'GPA 3.8/4.0 · 专业前 5%',
        bullets: ['主修课程：数据结构、计算机网络、操作系统、编译原理、人机交互'],
      },
    ],
  },
  skills: {
    title: '专业技能',
    make: () => [
      { id: uid('it'), title: '前端框架', tags: ['Vue 3', 'Nuxt', 'React', 'TypeScript'] },
      { id: uid('it'), title: '工程化', tags: ['Vite', 'Webpack', 'pnpm', 'CI/CD', 'Vitest'] },
      { id: uid('it'), title: '样式与设计', tags: ['Tailwind CSS', 'shadcn-vue', 'Figma'] },
      {
        id: uid('it'),
        title: '质量与协作',
        tags: ['Vitest', 'Playwright', 'ESLint', 'Code Review', '技术分享'],
      },
      {
        id: uid('it'),
        title: '后端与运维',
        tags: ['Node.js', 'Nest.js', 'MySQL', 'Redis', 'Docker'],
      },
    ],
  },
  awards: {
    title: '荣誉奖项',
    make: () => [
      { id: uid('it'), title: '公司年度优秀员工（前 5%）', start: '2024.01' },
      {
        id: uid('it'),
        title: '技术创新奖 · 前端监控体系建设',
        subtitle: '某某科技有限公司',
        start: '2023.06',
      },
      { id: uid('it'), title: '全国大学生服务外包创新创业大赛 · 一等奖', start: '2019.05' },
      { id: uid('it'), title: '校级优秀毕业生', start: '2020.06' },
    ],
  },
  certificates: {
    title: '证书资质',
    make: () => [{ id: uid('it'), title: 'CET-6 · 586 分', start: '2018.12' }],
  },
  publications: {
    title: '论文发表',
    make: () => [
      {
        id: uid('it'),
        title: '基于注意力机制的前端性能预测模型',
        subtitle: '《计算机应用研究》',
        start: '2023.09',
      },
    ],
  },
  languages: {
    title: '语言能力',
    make: () => [
      { id: uid('it'), title: '中文', extra: '母语' },
      { id: uid('it'), title: '英语', extra: 'CET-6 · 可无障碍阅读技术文档' },
    ],
  },
  custom: {
    title: '自定义模块',
    make: () => [{ id: uid('it'), title: '标题', description: '在这里填写内容…' }],
  },
}

export const SECTION_LABELS: Record<SectionType, string> = {
  summary: '个人简介',
  experience: '工作经历',
  projects: '项目经历',
  education: '教育经历',
  skills: '专业技能',
  awards: '荣誉奖项',
  certificates: '证书资质',
  publications: '论文发表',
  languages: '语言能力',
  custom: '自定义模块',
}

export function createSection(type: SectionType, column: 'main' | 'side' = 'main'): ResumeSection {
  const preset = SECTION_PRESETS[type] ?? SECTION_PRESETS.custom
  return {
    id: uid('sec'),
    type,
    title: preset.title,
    visible: true,
    column,
    items: preset.make(),
  }
}

/* ------------------------------------------------------------------
 * 示例简历
 * ------------------------------------------------------------------ */
export function createSampleResume(): ResumeData {
  /* 数组顺序 = 单栏模板的呈现顺序；column 决定双栏模板里归哪一栏。
     教育经历放在项目经历之后，符合"有工作经验者优先展示经历"的惯例。 */
  const layout: Array<[SectionType, 'main' | 'side']> = [
    ['summary', 'main'],
    ['experience', 'main'],
    ['projects', 'main'],
    ['education', 'side'],
    ['skills', 'side'],
    ['awards', 'main'],
    ['languages', 'side'],
    ['certificates', 'side'],
  ]

  return {
    basics: {
      name: '沐辰',
      headline: '高级前端工程师 · Vue / Nuxt 方向',
      email: 'muchen@example.com',
      phone: '138 0000 8888',
      location: '上海 · 浦东新区',
      website: 'muchen.dev',
      github: 'github.com/muchen',
      weibo: '',
      avatar: '',
      avatarShape: 'circle',
      avatarPosition: 'left',
      avatarSize: 1,
      showAvatar: false,
      links: [],
    },
    sections: layout.map(([t, c]) => createSection(t, c)),
    design: { ...DEFAULT_DESIGN },
  }
}

/* ------------------------------------------------------------------
 * 空白简历
 * ------------------------------------------------------------------ */
export function createEmptyResume(): ResumeData {
  return {
    basics: {
      name: '',
      headline: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      github: '',
      weibo: '',
      avatar: '',
      avatarShape: 'circle',
      avatarPosition: 'left',
      avatarSize: 1,
      showAvatar: false,
      links: [],
    },
    sections: [createSection('experience', 'main')],
    design: { ...DEFAULT_DESIGN },
  }
}

/* ------------------------------------------------------------------
 * 全局状态
 * ------------------------------------------------------------------ */
/* 提升版本号：联系方式默认不再显示图标，旧缓存里存的是 showIcons:true，需让其失效 */
const STORAGE_KEY = 'resumeforge:v3'

export function useResume() {
  const resume = useState<ResumeData>('resume', () => createSampleResume())
  const history = useState<{ past: string[]; future: string[] }>('resume-history', () => ({
    past: [],
    future: [],
  }))
  const savedAt = useState<number>('resume-saved-at', () => 0)

  let snapshotTimer: ReturnType<typeof setTimeout> | null = null

  /** 记录一次快照（用于撤销） */
  function snapshot() {
    if (snapshotTimer) clearTimeout(snapshotTimer)
    snapshotTimer = setTimeout(() => {
      const s = JSON.stringify(resume.value)
      const last = history.value.past[history.value.past.length - 1]
      if (last === s) return
      history.value.past.push(s)
      if (history.value.past.length > 60) history.value.past.shift()
      history.value.future = []
      persist()
    }, 500)
  }

  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resume.value))
      savedAt.value = Date.now()
    } catch {
      /* 存储配额溢出：忽略 */
    }
  }

  function restore() {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as ResumeData
      if (parsed?.basics && Array.isArray(parsed?.sections)) {
        resume.value = { ...parsed, design: { ...DEFAULT_DESIGN, ...parsed.design } }
      }
    } catch {
      /* 损坏数据：忽略 */
    }
  }

  function undo() {
    const prev = history.value.past.pop()
    if (!prev) return
    history.value.future.push(JSON.stringify(resume.value))
    resume.value = JSON.parse(prev)
    persist()
  }

  function redo() {
    const next = history.value.future.pop()
    if (!next) return
    history.value.past.push(JSON.stringify(resume.value))
    resume.value = JSON.parse(next)
    persist()
  }

  const canUndo = computed(() => history.value.past.length > 0)
  const canRedo = computed(() => history.value.future.length > 0)

  return {
    resume,
    savedAt,
    restore,
    persist,
    snapshot,
    undo,
    redo,
    canUndo,
    canRedo,
  }
}
