<script setup lang="ts">
import { Check, FileDown, FileText, Loader2, Printer } from 'lucide-vue-next'
import { usePdfExport } from '~/composables/usePdfExport'
import { paperDimensions } from '~/utils/paper'

const { resume } = useResume()
const { exportOpen, exporting, stats } = useEditor()

const { busy, progress, status, exportPdf, printResume } = usePdfExport()

const filename = ref('')
const dpi = ref(200)
const format = ref<'jpeg' | 'png'>('jpeg')

watch(exportOpen, (v) => {
  if (v && !filename.value) {
    filename.value = `${resume.value.basics.name || '我的'}-简历`
  }
})

const dpiOptions = [
  { value: 96, label: '屏幕', hint: '96 DPI · 体积最小' },
  { value: 150, label: '标准', hint: '150 DPI · 日常投递' },
  { value: 200, label: '高清', hint: '200 DPI · 推荐' },
  { value: 300, label: '印刷', hint: '300 DPI · 体积最大' },
]

const design = computed(() => resume.value.design)
const dims = computed(() => paperDimensions(design.value.paper, design.value.orientation))

const estimate = computed(() => {
  const base = dims.value.width * dims.value.height
  const px = base * (dpi.value / 25.4) ** 2
  const bytes = format.value === 'png' ? px * 0.28 : px * 0.1
  const mb = (bytes * stats.value.pages) / 1024 / 1024
  return `${mb < 1 ? `${Math.round(mb * 1024)} KB` : `${mb.toFixed(1)} MB`} 左右`
})

async function doExport() {
  exporting.value = true
  try {
    await exportPdf({
      paperKey: design.value.paper,
      orientation: design.value.orientation,
      dpi: dpi.value,
      format: format.value,
      quality: 0.94,
      filename: `${filename.value || '简历'}.pdf`,
      meta: {
        title: `${resume.value.basics.name || ''} 的简历`,
        author: resume.value.basics.name || '',
      },
    })
    exportOpen.value = false
  } catch (err) {
    status.value = err instanceof Error ? err.message : '导出失败，请重试'
  } finally {
    exporting.value = false
  }
}

async function doPrint() {
  exportOpen.value = false
  await nextTick()
  await printResume(design.value.paper, design.value.orientation)
}
</script>

<template>
  <Dialog v-model:open="exportOpen">
    <DialogContent class="max-w-xl">
      <DialogHeader>
        <DialogTitle>导出 PDF</DialogTitle>
        <DialogDescription>
          当前为 {{ dims.def.label }} {{ design.orientation === 'portrait' ? '纵向' : '横向' }} · 共
          {{ stats.pages }} 页 · 预计文件大小 {{ estimate }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <!-- 文件名 -->
        <div class="space-y-1.5">
          <Label>文件名</Label>
          <div class="flex items-center gap-2">
            <Input v-model="filename" placeholder="我的简历" />
            <span class="text-muted-foreground shrink-0 text-[13px]">.pdf</span>
          </div>
        </div>

        <!-- 清晰度 -->
        <div class="space-y-1.5">
          <Label>清晰度</Label>
          <div class="grid grid-cols-4 gap-1.5">
            <button
              v-for="d in dpiOptions"
              :key="d.value"
              class="rounded-lg border px-2 py-2 text-center transition-colors"
              :class="dpi === d.value ? 'border-brand bg-brand-soft' : 'hover:bg-accent'"
              @click="dpi = d.value"
            >
              <div class="text-[12.5px] font-medium">{{ d.label }}</div>
              <div class="text-muted-foreground mt-0.5 text-[10px] leading-tight">{{ d.hint }}</div>
            </button>
          </div>
        </div>

        <!-- 格式 -->
        <div class="space-y-1.5">
          <Label>页面编码</Label>
          <div class="grid grid-cols-2 gap-1.5">
            <button
              class="flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors"
              :class="format === 'jpeg' ? 'border-brand bg-brand-soft' : 'hover:bg-accent'"
              @click="format = 'jpeg'"
            >
              <FileText class="size-4 shrink-0" />
              <span>
                <span class="block text-[12.5px] font-medium">JPEG</span>
                <span class="text-muted-foreground block text-[10.5px]">体积小，适合投递</span>
              </span>
            </button>
            <button
              class="flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors"
              :class="format === 'png' ? 'border-brand bg-brand-soft' : 'hover:bg-accent'"
              @click="format = 'png'"
            >
              <FileText class="size-4 shrink-0" />
              <span>
                <span class="block text-[12.5px] font-medium">PNG</span>
                <span class="text-muted-foreground block text-[10.5px]">无损，文件更大</span>
              </span>
            </button>
          </div>
        </div>

        <!-- 备选路径 -->
        <button
          class="flex w-full items-start gap-3 rounded-lg border border-dashed px-3 py-2.5 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50/50"
          @click="doPrint"
        >
          <Printer class="mt-0.5 size-4 shrink-0 text-emerald-600" />
          <span class="min-w-0">
            <span class="block text-[12.5px] font-medium">改用浏览器打印（文字可搜索）</span>
            <span class="text-muted-foreground block text-[11px] leading-relaxed">
              调用系统打印对话框，在「目标打印机」中选择「另存为 PDF」。 产出的是矢量
              PDF，体积更小、文字可复制检索，也更容易通过 ATS 简历筛选系统。
            </span>
          </span>
        </button>

        <!-- 进度 -->
        <div v-if="busy" class="space-y-1.5 rounded-lg bg-muted/50 px-3 py-2.5">
          <div class="flex items-center gap-2 text-[12px]">
            <Loader2 class="size-3.5 animate-spin" />
            {{ status || '正在导出…' }}
          </div>
          <div class="h-1 overflow-hidden rounded-full bg-background">
            <div
              class="h-full rounded-full bg-brand transition-all"
              :style="{ width: `${Math.round(progress * 100)}%` }"
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" size="sm" @click="exportOpen = false">取消</Button>
        <Button size="sm" class="gap-1.5" :disabled="busy" @click="doExport">
          <Loader2 v-if="busy" class="size-3.5 animate-spin" />
          <FileDown v-else class="size-3.5" />
          {{ busy ? '导出中…' : '导出 PDF' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
