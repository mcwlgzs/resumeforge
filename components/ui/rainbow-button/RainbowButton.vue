<script setup lang="ts">
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    /** 彩虹流动一圈的秒数 */
    speed?: number
    /** 是否显示外围柔光 */
    glow?: boolean
    class?: string
  }>(),
  { speed: 3, glow: true },
)

/** 首尾同色才能无缝循环；色相顺序与 SealCV 首页一致 */
const RAINBOW =
  'linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7, #d946ef, #f43f5e, #f59e0b, #22c55e, #06b6d4, #6366f1)'
</script>

<template>
  <span :class="cn('group relative inline-flex', props.class)">
    <!-- 外围柔光 -->
    <span
      v-if="glow"
      aria-hidden="true"
      class="pointer-events-none absolute -inset-1 rounded-xl opacity-60 blur-lg transition-opacity duration-300 group-hover:opacity-90"
      :style="{
        background: RAINBOW,
        backgroundSize: '200% 100%',
        animation: `rainbow-slide ${props.speed}s linear infinite`,
      }"
    />

    <!-- 渐变描边 + 实底内层 -->
    <span
      class="relative inline-flex rounded-lg p-[1.5px]"
      :style="{
        background: RAINBOW,
        backgroundSize: '200% 100%',
        animation: `rainbow-slide ${props.speed}s linear infinite`,
      }"
    >
      <span
        class="inline-flex items-center gap-1.5 rounded-[6.5px] bg-neutral-900 px-5 py-2.5 text-[14px] font-semibold text-white transition-colors group-hover:bg-neutral-800"
      >
        <slot />
      </span>
    </span>
  </span>
</template>
