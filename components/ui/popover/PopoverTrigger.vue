<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { PopoverTrigger, type PopoverTriggerProps } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<PopoverTriggerProps & { class?: HTMLAttributes['class'] }>()
const delegatedProps = reactiveOmit(props, 'class')
</script>

<template>
  <PopoverTrigger v-bind="delegatedProps" :class="cn('outline-none', props.class)">
    <slot />
  </PopoverTrigger>
</template>
