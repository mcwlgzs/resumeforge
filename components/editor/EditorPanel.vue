<script setup lang="ts">
import { LayoutTemplate, Sparkles, UserRound } from 'lucide-vue-next'

const { activeTab } = useEditor()
const { isWide } = useBreakpoint()

// 三栏模式下设计面板已在右侧常驻，避免重复入口
watch(
  isWide,
  (wide) => {
    if (wide && activeTab.value === 'design') activeTab.value = 'content'
  },
  { immediate: true },
)
</script>

<template>
  <aside class="flex h-full w-full flex-col overflow-hidden bg-white">
    <Tabs v-model="activeTab" class="flex h-full min-h-0 flex-col">
      <div class="flex h-11 shrink-0 items-center border-b border-neutral-200 bg-white px-3">
        <TabsList class="bg-neutral-100">
          <TabsTrigger value="content"> <UserRound /> 内容 </TabsTrigger>
          <TabsTrigger v-if="!isWide" value="design"> <LayoutTemplate /> 设计 </TabsTrigger>
          <TabsTrigger value="polish"> <Sparkles /> 优化 </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="content" class="overflow-y-auto bg-neutral-50 px-3 py-3">
        <ContentPanel />
      </TabsContent>
      <TabsContent v-if="!isWide" value="design" class="overflow-y-auto bg-neutral-50 px-3 py-3">
        <DesignPanel />
      </TabsContent>
      <TabsContent value="polish" class="overflow-y-auto bg-neutral-50 px-3 py-3">
        <PolishPanel />
      </TabsContent>
    </Tabs>
  </aside>
</template>
