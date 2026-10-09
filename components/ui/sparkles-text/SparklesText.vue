<script setup lang="ts">
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    text: string
    /** 星点的两种颜色 */
    colors?: { first: string; second: string }
    sparklesCount?: number
    /** 是否使用渐变色文字；默认关闭，纯色更稳重 */
    gradient?: boolean
    class?: string
  }>(),
  {
    colors: () => ({ first: '#6366f1', second: '#a855f7' }),
    sparklesCount: 12,
    gradient: false,
  },
)

interface Sparkle {
  id: number
  x: string
  y: string
  color: string
  delay: number
  size: number
  duration: number
}

/** 星点位置随机，因此只在客户端生成，避免水合不一致 */
const sparkles = ref<Sparkle[]>([])

function random(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function generate() {
  const list: Sparkle[] = []
  for (let i = 0; i < props.sparklesCount; i++) {
    list.push({
      id: i,
      // 稍微外扩，让星点围绕在文字四周而不是全压在字上
      x: `${random(-4, 104)}%`,
      y: `${random(-12, 112)}%`,
      color: Math.random() > 0.5 ? props.colors.first : props.colors.second,
      delay: random(0, 3.5),
      size: random(9, 19),
      duration: random(2.2, 4.2),
    })
  }
  sparkles.value = list
}

onMounted(generate)
</script>

<template>
  <span :class="cn('relative inline-block', props.class)">
    <span
      class="relative z-10"
      :class="
        props.gradient
          ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent'
          : 'text-neutral-900'
      "
    >
      {{ text }}
    </span>

    <span
      v-for="s in sparkles"
      :key="s.id"
      class="pointer-events-none absolute z-20 will-change-transform"
      :style="{
        left: s.x,
        top: s.y,
        color: s.color,
        width: `${s.size}px`,
        height: `${s.size}px`,
        animation: `sparkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
      }"
    >
      <svg viewBox="0 0 160 160" fill="currentColor" class="size-full">
        <path
          d="M80 0C80 0 84.2846 41.2925 101.496 58.504C118.707 75.7154 160 80 160 80C160 80 118.707 84.2846 101.496 101.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.504 101.496C41.2925 84.2846 0 80 0 80C0 80 41.2925 75.7154 58.504 58.504C75.7154 41.2925 80 0 80 0Z"
        />
      </svg>
    </span>
  </span>
</template>
