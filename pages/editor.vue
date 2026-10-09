<script setup lang="ts">
import { Lightbulb, X } from 'lucide-vue-next'

const { resume, restore, snapshot } = useResume()
const { isWide } = useBreakpoint()

const tipDismissed = ref(true)

onMounted(() => {
  restore()
  try {
    tipDismissed.value = localStorage.getItem('rf:tip-dismissed') === '1'
  } catch {
    tipDismissed.value = false
  }
})

function dismissTip() {
  tipDismissed.value = true
  try {
    localStorage.setItem('rf:tip-dismissed', '1')
  } catch {
    /* 隐私模式下忽略 */
  }
}

// 任何改动都会在防抖后写入 localStorage，并记录一次撤销快照
watch(
  () => resume.value,
  () => snapshot(),
  { deep: true },
)

useHead({
  title: '编辑简历 · ResumeForge',
})
</script>

<template>
  <div class="flex h-dvh flex-col overflow-hidden bg-neutral-100">
    <TopBar />

    <!-- 首次进入的引导 -->
    <div
      v-if="!tipDismissed"
      class="border-brand-border bg-brand-soft mx-2 mt-2 flex shrink-0 items-center gap-2.5 rounded-lg border px-3.5 py-2"
    >
      <Lightbulb class="text-brand size-3.5 shrink-0" />
      <p class="text-brand-foreground min-w-0 flex-1 text-[12px] leading-relaxed">
        当前展示的是<strong class="font-semibold">示例简历</strong>，直接在左侧改成你的内容即可。
        所有改动会自动保存在本机浏览器，不会上传。想从零开始，可以点右上角的
        <strong class="font-semibold">JSON 图标 → 新建空白简历</strong>。
      </p>
      <button
        class="text-brand/70 hover:bg-brand/10 hover:text-brand flex size-6 shrink-0 items-center justify-center rounded transition-colors"
        title="不再提示"
        @click="dismissTip"
      >
        <X class="size-3.5" />
      </button>
    </div>

    <!-- 浮起的面板：面板之间留缝隙，各自成卡片 -->
    <div class="flex min-h-0 flex-1 flex-col gap-2 p-2 lg:flex-row">
      <!-- 左：内容 -->
      <div
        class="flex w-full shrink-0 flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] lg:h-full lg:w-[340px] xl:w-[356px]"
        :class="tipDismissed ? 'h-[46%]' : 'h-[42%]'"
      >
        <EditorPanel />
      </div>

      <!-- 中：预览画布 -->
      <div
        class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
      >
        <PreviewPane />
      </div>

      <!-- 右：设计（宽屏常驻） -->
      <div
        v-if="isWide"
        class="hidden w-[288px] shrink-0 flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] lg:flex"
      >
        <DesignSidebar />
      </div>
    </div>

    <ExportDialog />
  </div>
</template>
