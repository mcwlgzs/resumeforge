<script setup lang="ts">
import { SlidersHorizontal, RotateCcw } from 'lucide-vue-next'
</script>

<template>
  <aside class="flex h-full w-full flex-col overflow-hidden bg-white">
    <!-- 面板头 -->
    <div class="flex h-11 shrink-0 items-center gap-2 border-b border-neutral-200 px-3.5">
      <SlidersHorizontal class="size-3.5 text-neutral-400" />
      <span class="text-[12.5px] font-semibold text-neutral-800">设计与排版</span>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto bg-neutral-50 px-3.5 py-4">
      <DesignPanel />
    </div>
  </aside>
</template>
