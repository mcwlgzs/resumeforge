<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { SelectLabel, type SelectLabelProps } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<SelectLabelProps & { class?: HTMLAttributes['class'] }>()
const delegatedProps = reactiveOmit(props, 'class')
</script>

<template>
  <SelectLabel
    :class="cn('text-muted-foreground px-2 py-1.5 text-xs font-medium tracking-wide', props.class)"
    v-bind="delegatedProps"
  >
    <slot />
  </SelectLabel>
</template>
