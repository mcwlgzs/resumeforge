/**
 * 生成 GitHub Git Data API 所需的 payload（不发起网络请求，也不 spawn 子进程）。
 *
 * 用法：
 *   node tools/gen-push-payload.mjs tree  <outFile>              生成 tree payload
 *   node tools/gen-push-payload.mjs commit <outFile> <treeSha> <messageFile>
 *
 * 说明：本机沙箱禁止 Node spawn 子进程、也禁止 git 直连，因此网络请求交给 curl，
 *       这里只做「读文件 → 产出 JSON」这一件事。
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const ROOT = process.cwd()
const [mode, outFile, ...rest] = process.argv.slice(2)

/** 与 .gitignore 保持一致的排除规则 */
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.nuxt',
  '.output',
  '.data',
  'dist',
  '.workbuddy',
  '.push-tmp',
])
const SKIP_FILES = new Set(['.DS_Store'])

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const rel = relative(ROOT, full).split(sep).join('/')
    const st = statSync(full)
    if (st.isDirectory()) {
      if (SKIP_DIRS.has(name)) continue
      walk(full, acc)
    } else {
      if (SKIP_FILES.has(name) || name.endsWith('.log')) continue
      acc.push(rel)
    }
  }
  return acc
}

if (mode === 'tree') {
  const files = walk(ROOT).sort()
  const tree = files.map((path) => ({
    path,
    mode: '100644',
    type: 'blob',
    content: readFileSync(path, 'utf8'),
  }))
  const bytes = tree.reduce((n, t) => n + Buffer.byteLength(t.content, 'utf8'), 0)
  writeFileSync(outFile, JSON.stringify({ tree }), 'utf8')
  console.log(`文件数 ${tree.length}，内容 ${(bytes / 1024).toFixed(0)} KB → ${outFile}`)
} else if (mode === 'commit') {
  const [treeSha, messageFile] = rest
  const payload = {
    message: readFileSync(messageFile, 'utf8'),
    tree: treeSha,
    parents: [],
  }
  writeFileSync(outFile, JSON.stringify(payload), 'utf8')
  console.log(`commit payload → ${outFile}`)
} else {
  console.error('未知模式，应为 tree 或 commit')
  process.exit(1)
}
