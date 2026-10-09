<script setup lang="ts">
import { TabsRoot, useForwardPropsEmits, type TabsRootEmits, type TabsRootProps } from 'reka-ui'

const props = defineProps<TabsRootProps>()
const emits = defineEmits<TabsRootEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <TabsRoot v-bind="forwarded" class="flex flex-col min-h-0">
    <slot />
  </TabsRoot>
</template>
