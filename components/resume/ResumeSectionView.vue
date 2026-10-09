<script setup lang="ts">
import type { ResumeSection } from '~/types/resume'
import { hexToRgba } from '~/utils/color'

const props = defineProps<{
  section: ResumeSection
  accent: string
  headingStyle: 'plain' | 'underline' | 'bar' | 'boxed' | 'dot'
  gap: number
  compact?: boolean
  /** 侧栏内的小标题更紧凑 */
  dense?: boolean
}>()

const items = computed(() => props.section.items.filter((i) => !i.hidden))

/** 预计算 rgba，避免导出引擎不识别 color-mix() */
const accentVars = computed(() => ({
  '--rs-accent': props.accent,
  '--rs-accent-soft': hexToRgba(props.accent, 0.11),
  '--rs-accent-line': hexToRgba(props.accent, 0.5),
  /* 必须是无单位数值：CSS 里 calc() 不允许「长度 × 长度」，
     若写成 "1em"，calc(var(--rs-gap) * 1.25em) 会因 em×em 非法而被整条丢弃 */
  '--rs-gap': String(props.gap),
}))
</script>

<template>
  <section class="rs-section" :style="accentVars">
    <!-- 标题块：与首个条目绑定，避免标题落单 -->
    <div
      data-block
      data-keep="1"
      class="rs-heading"
      :class="[
        headingStyle === 'underline' && 'rs-heading-underline',
        headingStyle === 'bar' && 'rs-heading-bar',
        headingStyle === 'boxed' && 'rs-heading-boxed',
        headingStyle === 'dot' && 'rs-heading-dot',
      ]"
    >
      <span class="rs-heading-text">{{ section.title }}</span>
      <span v-if="headingStyle === 'underline'" class="rs-heading-rule" />
    </div>

    <div class="rs-items">
      <div v-for="item in items" :key="item.id" data-block class="rs-item-wrap">
        <ResumeItemView :item="item" :accent="accent" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.rs-section + .rs-section {
  margin-top: calc(var(--rs-gap, 1) * 1.25em);
}
.rs-heading {
  font-weight: 600;
  font-size: 1.08em;
  letter-spacing: 0;
  line-height: 1.4;
  color: #111827;
}
.rs-heading-text {
  position: relative;
}

/* 下划线风格 */
.rs-heading-underline {
  display: flex;
  align-items: center;
  gap: 0.6em;
  padding-bottom: 0.2em;
  border-bottom: 0.06em solid var(--rs-accent-line);
}
.rs-heading-underline .rs-heading-rule {
  display: none;
}

/* 左色条 */
.rs-heading-bar {
  padding-left: 0.55em;
  border-left: 0.22em solid var(--rs-accent);
}

/* 色块 */
.rs-heading-boxed {
  display: inline-block;
  padding: 0.16em 0.6em;
  border-radius: 0.25em;
  background: var(--rs-accent-soft);
  color: var(--rs-accent);
}
.rs-heading-boxed + .rs-items {
  margin-top: 0.45em;
}

/* 圆点 */
.rs-heading-dot {
  display: flex;
  align-items: center;
  gap: 0.5em;
}
.rs-heading-dot .rs-heading-text::before {
  content: '';
  display: inline-block;
  width: 0.42em;
  height: 0.42em;
  margin-right: 0.42em;
  border-radius: 999px;
  background: var(--rs-accent);
  vertical-align: 0.08em;
}

.rs-items {
  margin-top: 0.45em;
  display: flex;
  flex-direction: column;
  gap: calc(var(--rs-gap, 1) * 0.62em);
}
</style>
