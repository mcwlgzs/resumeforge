<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { TooltipTrigger, type TooltipTriggerProps } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<TooltipTriggerProps & { class?: HTMLAttributes['class'] }>()
const delegatedProps = reactiveOmit(props, 'class')
</script>

<template>
  <TooltipTrigger v-bind="delegatedProps" :class="cn('outline-none', props.class)">
    <slot />
  </TooltipTrigger>
</template>
