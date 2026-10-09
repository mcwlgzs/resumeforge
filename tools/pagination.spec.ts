/**
 * 分页内核与智能一页算法的离线验证。
 * 运行：node --experimental-strip-types tools/pagination.spec.ts
 */
import { computeBreaks, fitToHeight, type BlockMetric } from '../composables/usePagination.ts'

declare const process: { exit(code?: number): void }

let pass = 0
let fail = 0

function check(name: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a === e) {
    pass++
    console.log(`  ✓ ${name}`)
  } else {
    fail++
    console.log(`  ✗ ${name}\n      期望 ${e}\n      实际 ${a}`)
  }
}

function blocks(spec: Array<[top: number, height: number, keep?: boolean]>): BlockMetric[] {
  return spec.map(([top, height, keep]) => ({ top, height, keep: !!keep }))
}

console.log('\n[1] 基础贪心装箱')
{
  const r = computeBreaks(
    blocks([
      [0, 100],
      [100, 100],
      [200, 100],
    ]),
    {
      firstAvail: 250,
      restAvail: 250,
    },
  )
  check('页数 = 2', r.offsets.length, 2)
  check('第一页从头开始', r.offsets[0], 0)
  check('第二页从第三块顶部开始', r.offsets[1], 200)
  check('无溢出', r.overflowBlocks, 0)
}

console.log('\n[2] 首页可用高度更小（页眉占用）')
{
  const r = computeBreaks(
    blocks([
      [0, 100],
      [100, 100],
      [200, 100],
    ]),
    {
      firstAvail: 150,
      restAvail: 250,
    },
  )
  check('页数 = 2', r.offsets.length, 2)
  check('第二页从第二块开始', r.offsets[1], 100)
}

console.log('\n[3] 标题与首条内容必须同页（keep-with-next）')
{
  // 首页只剩 100，标题(30)+正文(150)=180 放不进首页，但整组能放进完整一页；
  // 此时放宽 keep 放行标题，避免出现整页空白
  const r = computeBreaks(
    blocks([
      [0, 30, true],
      [30, 150],
      [180, 60],
    ]),
    {
      firstAvail: 100,
      restAvail: 250,
    },
  )
  check('不产生空白页', r.offsets, [0, 30])
  check('未被判定为溢出', r.overflowBlocks, 0)
}
{
  // 正常情况下标题应跟随首条内容进入下一页，不留在页尾
  const r = computeBreaks(
    blocks([
      [0, 100],
      [100, 30, true],
      [130, 150],
    ]),
    {
      firstAvail: 220,
      restAvail: 220,
    },
  )
  check('标题被整体推到下一页', r.offsets, [0, 100])
  check('未标记溢出', r.overflowBlocks, 0)
}
{
  // 组本身就高于一整页 → 只能强制放置
  const r = computeBreaks(
    blocks([
      [0, 40, true],
      [40, 200],
    ]),
    {
      firstAvail: 220,
      restAvail: 220,
    },
  )
  check('组高于整页时仍能分页', r.offsets, [0, 40])
  check('被标记为溢出', r.overflowBlocks, 1)
}

console.log('\n[4] 内容刚好放得下时不产生多余空页')
{
  const r = computeBreaks(
    blocks([
      [0, 120],
      [120, 120],
    ]),
    {
      firstAvail: 240,
      restAvail: 240,
    },
  )
  check('仅 1 页', r.offsets.length, 1)
}

console.log('\n[5] 单个条目高于整页 → 标记溢出且不死循环')
{
  const r = computeBreaks(
    blocks([
      [0, 400],
      [400, 50],
    ]),
    {
      firstAvail: 200,
      restAvail: 200,
    },
  )
  check('溢出计数 = 1', r.overflowBlocks, 1)
  check('分成 2 页', r.offsets.length, 2)
}

console.log('\n[6] 空内容')
{
  const r = computeBreaks([], { firstAvail: 200, restAvail: 200 })
  check('至少 1 页', r.offsets.length, 1)
  check('偏移为 0', r.offsets[0], 0)
}

console.log('\n[7] 智能一页：压缩（内容高度与字号成正比）')
{
  let applied = 1
  const measure = () => 1500 * applied
  const scale = fitToHeight(1000, {
    mode: 'shrink',
    measure,
    applyScale: (s) => (applied = s),
    maxScale: 1.4,
  })
  check('结果落在一页内', measure() <= 1002, true)
  check('缩放约为 0.667', Math.abs(scale - 2 / 3) < 0.01, true)
  console.log(`      最终 scale=${scale.toFixed(3)}，高度=${measure().toFixed(1)}px / 1000px`)
}

console.log('\n[8] 智能一页：内容本就不足时保持原样')
{
  let applied = 1
  const scale = fitToHeight(1000, {
    mode: 'shrink',
    measure: () => 600 * applied,
    applyScale: (s) => (applied = s),
  })
  check('scale 保持 1', scale, 1)
}

console.log('\n[9] 智能一页：撑满模式会放大且不越上限')
{
  let applied = 1
  const scale = fitToHeight(1000, {
    mode: 'stretch',
    measure: () => 750 * applied,
    applyScale: (s) => (applied = s),
    maxScale: 1.4,
  })
  check('发生了放大', scale > 1, true)
  check('不超过上限 1.4', scale <= 1.4, true)
  check('放大后不超出页面', 750 * scale <= 1002, true)
  console.log(`      最终 scale=${scale.toFixed(3)}，高度=${(750 * scale).toFixed(1)}px / 1000px`)
}

console.log('\n[10] 关闭智能一页时 scale 恒为 1')
{
  let applied = 9
  const scale = fitToHeight(1000, {
    mode: 'off',
    measure: () => 5000 * applied,
    applyScale: (s) => (applied = s),
  })
  check('scale = 1', scale, 1)
  check('已重置为 1', applied, 1)
}

console.log('\n[11] 极端内容：超过下限时不无限压缩')
{
  let applied = 1
  const measure = () => 4000 * applied
  const scale = fitToHeight(1000, {
    mode: 'shrink',
    measure,
    applyScale: (s) => (applied = s),
    minScale: 0.6,
    maxScale: 1.4,
  })
  check('停在下限 0.6', scale, 0.6)
  console.log(`      剩余高度 ${measure().toFixed(0)}px / 1000px（由界面提示用户精简内容）`)
}

console.log(`\n结果：${pass} 通过，${fail} 失败\n`)
process.exit(fail ? 1 : 0)
