<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import {
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  useForwardProps,
  type TooltipContentProps,
} from 'reka-ui'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<
    TooltipContentProps & {
      class?: HTMLAttributes['class']
      arrow?: boolean
      sideOffset?: number
    }
  >(),
  { sideOffset: 6, arrow: true },
)

const delegatedProps = reactiveOmit(props, 'class', 'arrow')
const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <TooltipPortal>
    <TooltipContent
      v-bind="forwarded"
      :class="
        cn(
          'bg-foreground text-background z-100 w-fit max-w-64 rounded-md px-2.5 py-1.5 text-xs leading-relaxed shadow-md',
          'data-[state=delayed-open]:animate-in data-[state=closed]:animate-out',
          props.class,
        )
      "
    >
      <slot />
      <TooltipArrow v-if="arrow" class="fill-foreground" :width="9" :height="5" />
    </TooltipContent>
  </TooltipPortal>
</template>
