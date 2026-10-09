# ResumeForge · 在线简历制作工具

一个纯前端的可视化简历编辑器：左边填内容、右边实时成稿。核心解决三件事——**智能一页**、**多尺寸纸张**、**多页 PDF 导出**。

技术栈：Nuxt 3 · Vue 3 · shadcn-vue（reka-ui + Tailwind CSS v4）· TypeScript

---

## 功能

### 页面结构

| 路由 | 说明 |
| --- | --- |
| `/` | 落地页：能力介绍、模板墙、纸张规格总览 |
| `/editor` | 编辑器：左侧填内容、右侧实时成稿 |

### 1. 智能一页

简历最现实的约束是「HR 只看一页」。这里把它做成一个可调的能力，而不是让用户手动反复折腾字号：

| 模式 | 行为 |
| --- | --- |
| 压缩到一页 | 内容超过一页时，自动按比例缩小字号，直到刚好落在页内 |
| 撑满一页 | 内容不足时自动放大，避免页面下半部大片空白 |
| 关闭 | 完全手动控制字号与行距，内容多了就自然分页 |

实现要点：字号变化时行高、外边距并非线性响应，因此采用**迭代测量**——先按 1.0 测量内容高度，按比例算出预估缩放系数，应用后重新测量，再修正，最多迭代 6 轮并做回补（`fitToHeight`）。缩放通过 CSS 变量注入到渲染根节点，模板内所有尺寸均以 `em` 表达，因此整篇排版是严格等比缩放，不会出现「字号变小但间距没变」的破版。

### 2. 多尺寸纸张

内置 14 种纸型，覆盖国内外实际会遇到的场景：

- **ISO 216**：A3 / A4 / A5 / B4 / B5
- **北美**：Letter / Legal / Tabloid / Executive
- **中国标准**：16 开 / 大 16 开 / 32 开
- **屏幕**：幻灯片 16:9 / 4:3

纸张尺寸以毫米为唯一真源，预览按 96 dpi 换算成像素，导出时再以毫米交回 jsPDF，因此「预览看到的排版」与「PDF 里的排版」严格一致。支持纵向 / 横向切换，页边距可四边联动或独立设置。

### 3. 多页 PDF 导出

导出不是简单地把一整张长图塞进 PDF，而是**真实分页**：

1. 模板把「不可分割的最小单元」标记为 `[data-block]`（一个条目、一个模块标题）
2. 测量每个块相对列顶部的几何位置
3. 贪心装箱切页，并保证模块标题不与它下面的正文分离（`data-keep`）
4. 渲染层用 `translateY(-offset)` 做出「同一条内容流 + 多个观察窗口」的视觉效果

导出时逐页走 `html2canvas-pro` 截图（选它是因为它支持 Tailwind v4 的 `oklch` 现代色域），再按毫米尺寸写入 jsPDF。可选 96 / 150 / 200 / 300 DPI 与 JPEG / PNG 两种编码。

另外提供一条**浏览器打印**通道：调起系统打印对话框后选择「另存为 PDF」，产出的是矢量 PDF，文字可搜索、可复制，更容易通过 ATS 简历筛选系统。

### 还有

- 10 类内容模块各有专属图标与主题色（简介 / 工作 / 项目 / 教育 / 技能 / 荣誉 / 证书 / 论文 / 语言 / 自定义），左侧列表一眼可辨
- **拖拽排序**：按住卡片左侧手柄即可拖动模块与条目，实时重排、松手生效（不用点箭头一下下挪）
- 5 套版式模板、12 组主题色、6 种中英文字体栈、5 种模块标题样式
- 模块可跨栏摆放、单条可隐藏，卡片头部就地改标题
- 内容体检：要点过长、要目过多、空模块、缺联系方式等给出具体修改建议
- 撤销 / 重做、自动保存到 localStorage、JSON 导入导出备份、一键新建空白简历

---

## 快速开始

```bash
npm install
npm run dev
```

打开 http://localhost:3000

生产构建：

```bash
npm run build
npm run preview
```

---

## 目录结构

```
pages/
  index.vue          落地页（Hero 用真实简历组件渲染，非示意图）
  editor.vue         编辑器主界面
components/
  resume/            简历渲染层（与编辑 UI 完全解耦）
    PreviewCanvas.vue    分页编排、智能一页调度、多页窗口
    ResumeBody.vue       栏位布局、页眉、缩放根节点
    ResumeHeader.vue     基本信息头部（4 种风格）
    ResumeSectionView.vue 模块标题 + 条目容器
    ResumeItemView.vue   单条内容渲染
  editor/            编辑界面
    TopBar / EditorPanel / PreviewPane
    ContentPanel / DesignPanel / PolishPanel
    BasicsForm / SectionCard / ItemCard
    ExportDialog
  ui/                shadcn-vue 组件（Button/Input/Select/Tabs/Dialog/…）
composables/
  useResume.ts       简历数据模型、示例数据、持久化、撤销栈
  usePagination.ts   分页内核（块测量 / 贪心装箱 / 迭代缩放）
  usePdfExport.ts    PDF 导出与打印通道
  useDragSort.ts     原生拖拽排序（按住手柄才可拖）
  useEditor.ts       编辑器 UI 状态
utils/
  paper.ts           纸张规格表与单位换算
  templates.ts       模板元数据、字体栈、主题色
  sectionMeta.ts     模块图标与配色体系
  color.ts           颜色换算（规避导出引擎对 color-mix 的兼容问题）
  image.ts           头像压缩
types/resume.ts      数据模型定义
tools/
  pagination.spec.ts 分页与智能一页算法的离线断言
```

---

## 已知限制

- 导出走的是位图（canvas）路线，因此 PDF 内文字**不可选中**——如需可搜索文本请使用「浏览器打印」通道。
- 双栏模板采用「内容流 + 窗口裁剪」分页，若左右两栏内容量差距极大，短的一栏在后续页会留白（这是预期行为，背景色仍会铺满）。
- 超长单条（如一条要点就超过整页高度）无法被拆分，会被强制放置并由界面给出提示。

---

## 数据安全

所有数据都保存在浏览器 localStorage，不上传任何服务器。建议定期用顶栏的「导出 JSON 备份」留档。
