<script setup lang="ts">
import type { ResumeData } from '~/types/resume'
import { hexToRgba } from '~/utils/color'
import { fontStack, TEMPLATE_MAP } from '~/utils/templates'

const props = withDefaults(
  defineProps<{
    data: ResumeData
    /** 智能一页的缩放系数 */
    fitScale?: number
    shiftMain?: number
    shiftSide?: number
    showHeader?: boolean
    /** 渲染态：固定高度并裁剪；测量态：完整展开 */
    clip?: boolean
    availHeight?: number
    /** 该页无需渲染的栏位（分页错位时留白） */
    hideMain?: boolean
    hideSide?: boolean
    /** 强制覆盖模板（用于缩略图预览） */
    templateOverride?: string
  }>(),
  {
    fitScale: 1,
    shiftMain: 0,
    shiftSide: 0,
    showHeader: true,
    clip: false,
    availHeight: 0,
    hideMain: false,
    hideSide: false,
  },
)

const tpl = computed(
  () => TEMPLATE_MAP[props.templateOverride ?? props.data.design.template] ?? TEMPLATE_MAP.classic,
)

const design = computed(() => props.data.design)
const accent = computed(() => design.value.accent || tpl.value.accent)

const mainSections = computed(() =>
  props.data.sections.filter((s) => s.visible && s.column !== 'side'),
)
const sideSections = computed(() =>
  props.data.sections.filter((s) => s.visible && s.column === 'side'),
)

const hasSide = computed(() => tpl.value.columns === 2)

const rootStyle = computed(() => ({
  fontSize: `${((design.value.baseFontSize * 96) / 72) * props.fitScale}px`,
  lineHeight: String(design.value.lineHeight),
  fontFamily: fontStack(design.value.fontFamily),
  color: '#1a1a1a',
  ...(props.clip && props.availHeight
    ? { height: `${props.availHeight}px`, display: 'flex', flexDirection: 'column' as const }
    : {}),
}))

const layoutStyle = computed(() => {
  if (!hasSide.value) return { flex: props.clip ? '1 1 auto' : undefined, minHeight: '0' }
  return {
    display: 'grid',
    gridTemplateColumns: `${design.value.sideWidth}% 1fr`,
    gap: '1.5em',
    flex: props.clip ? '1 1 auto' : undefined,
    minHeight: '0',
  }
})

const clipStyle = computed(() => (props.clip ? { height: '100%', overflow: 'hidden' } : {}))

const sideClipStyle = computed(() => (props.clip ? { height: '100%', overflow: 'hidden' } : {}))

const headerInner = computed(() => tpl.value.header)
</script>

<template>
  <div class="rs-root" :style="rootStyle" data-resume-body>
    <!-- 页眉 -->
    <div v-show="showHeader" class="rs-header-block">
      <ResumeHeader
        :basics="data.basics"
        :accent="accent"
        :variant="headerInner"
        :show-contacts="design.showContacts !== false"
        :show-icons="design.showIcons"
      />
    </div>

    <!-- 布局 -->
    <div class="rs-layout" :style="layoutStyle">
      <!-- 侧栏 -->
      <div
        v-if="hasSide"
        data-column="side"
        class="rs-col rs-col-side"
        :style="{
          background: hexToRgba(accent, 0.05),
          borderRadius: '0.35em',
          padding: '0.85em 0.85em 0.9em',
        }"
      >
        <div v-if="!hideSide" :style="sideClipStyle">
          <div
            class="rs-shift"
            :style="{ transform: `translateY(${-shiftSide}px)`, willChange: 'transform' }"
          >
            <ResumeSectionView
              v-for="sec in sideSections"
              :key="sec.id"
              :section="sec"
              :accent="accent"
              :heading-style="design.headingStyle || tpl.heading"
              :gap="design.sectionGap"
              dense
            />
          </div>
        </div>
      </div>

      <!-- 主栏 -->
      <div data-column="main" class="rs-col rs-col-main">
        <div v-if="!hideMain" :style="clipStyle">
          <div
            class="rs-shift"
            :style="{ transform: `translateY(${-shiftMain}px)`, willChange: 'transform' }"
          >
            <ResumeSectionView
              v-for="sec in mainSections"
              :key="sec.id"
              :section="sec"
              :accent="accent"
              :heading-style="design.headingStyle || tpl.heading"
              :gap="design.sectionGap"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rs-root {
  width: 100%;
  box-sizing: border-box;
}
.rs-header-block {
  padding-bottom: 0.9em;
  flex: 0 0 auto;
}
/* 侧栏整体字号略小，信息密度更高 */
.rs-col-side {
  font-size: 0.94em;
}
/* 侧栏更紧凑，间距系数比主栏小 */
.rs-col-side :deep(.rs-section + .rs-section) {
  margin-top: calc(var(--rs-gap, 1) * 0.72em);
}
</style>
