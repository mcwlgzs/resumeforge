import {
  Award,
  BadgeCheck,
  BookOpen,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Languages,
  LayoutGrid,
  Sparkles,
  UserRound,
  Wrench,
  type LucideIcon,
} from 'lucide-vue-next'
import type { SectionType } from '~/types/resume'

export interface SectionMeta {
  icon: LucideIcon
  /** 主题色（hex） */
  color: string
  /** 预计算的浅色底，避免导出引擎处理 color-mix */
  soft: string
  /** 预计算的描边色 */
  ring: string
  label: string
  hint: string
}

function rgba(hex: string, alpha: number) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const RAW: Record<SectionType, { icon: LucideIcon; color: string; label: string; hint: string }> = {
  summary: {
    icon: UserRound,
    color: '#4f46e5',
    label: '个人简介',
    hint: '3~4 句话讲清你的核心竞争力',
  },
  experience: {
    icon: Briefcase,
    color: '#2563eb',
    label: '工作经历',
    hint: '按时间倒序，突出可量化成果',
  },
  projects: {
    icon: FolderGit2,
    color: '#7c3aed',
    label: '项目经历',
    hint: '说明你负责什么、解决了什么问题',
  },
  education: {
    icon: GraduationCap,
    color: '#059669',
    label: '教育经历',
    hint: '学校、专业、时间与 GPA',
  },
  skills: {
    icon: Wrench,
    color: '#d97706',
    label: '专业技能',
    hint: '分组罗列，控制在 3~5 组',
  },
  awards: {
    icon: Award,
    color: '#e11d48',
    label: '荣誉奖项',
    hint: '含金量高的放前面',
  },
  certificates: {
    icon: BadgeCheck,
    color: '#0891b2',
    label: '证书资质',
    hint: '语言、职业资格、技术认证',
  },
  publications: {
    icon: BookOpen,
    color: '#9333ea',
    label: '论文发表',
    hint: '标注期刊或会议名称与时间',
  },
  languages: {
    icon: Languages,
    color: '#0d9488',
    label: '语言能力',
    hint: '标注等级或分数更有说服力',
  },
  custom: {
    icon: LayoutGrid,
    color: '#64748b',
    label: '自定义模块',
    hint: '志愿经历、社团、作品集等',
  },
}

export const SECTION_META = Object.fromEntries(
  Object.entries(RAW).map(([k, v]) => [
    k,
    { ...v, soft: rgba(v.color, 0.1), ring: rgba(v.color, 0.22) },
  ]),
) as unknown as Record<SectionType, SectionMeta>

export function sectionMeta(type: SectionType): SectionMeta {
  return SECTION_META[type] ?? SECTION_META.custom
}

export { rgba }
