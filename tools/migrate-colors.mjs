/**
 * 一次性设计令牌迁移：把分散的 indigo/violet 装饰色统一收敂到中性色体系。
 * 保留的唯一强调色是 black/white 与少量 brand blue。
 */
import { readFileSync, writeFileSync } from 'node:fs'

const files = [
  'components/editor/BasicsForm.vue',
  'components/editor/ContentPanel.vue',
  'components/editor/DesignPanel.vue',
  'components/editor/ExportDialog.vue',
  'components/editor/ItemCard.vue',
  'components/editor/PolishPanel.vue',
  'components/editor/TopBar.vue',
  'components/editor/PreviewPane.vue',
  'components/editor/EditorPanel.vue',
  'components/editor/SectionCard.vue',
  'pages/editor.vue',
]

/** 顺序敏感：长的、具体的规则必须排在通用规则之前 */
const rules = [
  // 选中态（按钮组 / 分段控件）
  [/border-indigo-\d+\s+bg-indigo-50\s+text-indigo-700/g, 'border-neutral-900 bg-neutral-900 text-white'],
  [/border-indigo-\d+\s+bg-indigo-50/g, 'border-neutral-900 bg-neutral-900'],
  [/bg-indigo-50\s+text-indigo-700\s+border-indigo-\d+/g, 'bg-neutral-900 text-white border-neutral-900'],
  [/bg-indigo-50\s+text-indigo-700/g, 'bg-neutral-900 text-white'],
  [/border-indigo-\d+\s+ring-2\s+ring-indigo-\d+/g, 'border-neutral-300'],
  [/ring-2\s+ring-indigo-\d+/g, ''],

  // 渐变 → 纯色
  [/bg-gradient-to-br\s+from-indigo-500\s+to-violet-600/g, 'bg-neutral-900'],
  [/bg-gradient-to-r\s+from-indigo-600\s+to-violet-600\s+bg-clip-text\s+text-transparent/g, 'text-neutral-900'],

  // hover 组合态
  [/hover:border-indigo-\d+\s+hover:bg-indigo-50\/\d+\s+hover:text-indigo-600/g, 'hover:border-neutral-400 hover:text-neutral-900'],
  [/hover:border-indigo-\d+/g, 'hover:border-neutral-400'],
  [/hover:bg-indigo-50\/\d+/g, 'hover:bg-neutral-100'],
  [/hover:bg-indigo-50/g, 'hover:bg-neutral-100'],
  [/hover:bg-indigo-100/g, 'hover:bg-neutral-100'],
  [/hover:text-indigo-\d+/g, 'hover:text-neutral-900'],

  // 单独出现的文字 / 背景 / 边框
  [/text-indigo-\d+/g, 'text-neutral-900'],
  [/bg-indigo-50\/\d+/g, 'bg-neutral-100'],
  [/bg-indigo-\d+/g, 'bg-neutral-900'],
  [/border-indigo-\d+\/\d+/g, 'border-neutral-300'],
  [/border-indigo-\d+/g, 'border-neutral-300'],
  [/ring-indigo-\d+/g, 'ring-neutral-200'],
  [/from-indigo-\d+/g, 'from-neutral-900'],
  [/to-violet-\d+/g, 'to-neutral-800'],
  [/text-violet-\d+/g, 'text-neutral-900'],
  [/bg-violet-\d+/g, 'bg-neutral-800'],
]

let totalChanges = 0

for (const f of files) {
  let src = readFileSync(f, 'utf8')
  const before = src
  for (const [re, to] of rules) src = src.replace(re, to)
  // 只压平替换产生的多余空格，不动其它属性格式
  src = src.replace(/  +/g, ' ')
  if (src !== before) {
    writeFileSync(f, src, 'utf8')
    totalChanges++
    const left = (src.match(/indigo|violet/g) || []).length
    console.log(`updated ${f}  (残留 indigo/violet: ${left})`)
  } else {
    console.log(`unchanged ${f}`)
  }
}
console.log(`\n共修改 ${totalChanges} 个文件`)
