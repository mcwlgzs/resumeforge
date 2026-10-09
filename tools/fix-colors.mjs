/**
 * 修复 migrate-colors.mjs 引入的问题：
 * 1. 原 bg-indigo-50（浅色底）被误换成 bg-neutral-900（近黑），导致"黑底黑字"
 * 2. 原 bg-indigo-500（小圆点）被换成 bg-neutral-9000，是无效 class
 * 3. 选中态统一接回品牌色（浅靛蓝底 + 靛蓝前景），而不是纯黑填充
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
  'components/editor/SectionCard.vue',
]

/** 顺序敏感：越具体的规则越靠前 */
const rules = [
  // 1) 黑底黑字 → 品牌色浅底
  [/bg-neutral-900 text-neutral-900/g, 'bg-brand-soft text-brand-foreground'],
  // 2) 无效 class（原小圆点 bg-indigo-500）
  [/bg-neutral-9000/g, 'bg-brand'],
  // 3) 半透明浅底
  [/bg-neutral-900\/\d+/g, 'bg-brand-soft'],
  // 4) 选中态填充块
  [
    /border-neutral-900 bg-neutral-900 text-white/g,
    'border-brand bg-brand-soft text-brand-foreground',
  ],
  [/border-neutral-900 bg-neutral-900/g, 'border-brand bg-brand-soft'],
  // 5) 进度条
  [/bg-neutral-900 transition-all/g, 'bg-brand transition-all'],
  // 6) 其余 border-neutral-900 全部是选中态描边
  [/border-neutral-900/g, 'border-brand'],
]

for (const f of files) {
  let src = readFileSync(f, 'utf8')
  const before = src
  for (const [re, to] of rules) src = src.replace(re, to)
  if (src !== before) {
    writeFileSync(f, src, 'utf8')
    const left = (src.match(/neutral-9000|bg-neutral-900/g) || []).length
    console.log(`fixed ${f}  (剩余 bg-neutral-900 类: ${left})`)
  } else {
    console.log(`unchanged ${f}`)
  }
}
