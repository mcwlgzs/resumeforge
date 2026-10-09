<script setup lang="ts">
import { ChevronDown, Eye, EyeOff, GripVertical, Plus, Trash2 } from 'lucide-vue-next'
import type { ResumeItem, ResumeSection } from '~/types/resume'
import { useDragSort } from '~/composables/useDragSort'
import { sectionMeta } from '~/utils/sectionMeta'

const props = defineProps<{
  section: ResumeSection
  twoColumn: boolean
}>()

const { resume } = useResume()
const { expandedId, openSections, toggleSection } = useEditor()

const meta = computed(() => sectionMeta(props.section.type))
const open = computed(() => !!openSections.value[props.section.id])
const visibleCount = computed(() => props.section.items.filter((i) => !i.hidden).length)

const { draggingId, arm, onDragStart, onDragOver, onDragEnd } = useDragSort(
  computed(() => resume.value.sections) as any,
)

const {
  draggingId: itemDraggingId,
  arm: armItem,
  onDragStart: onItemDragStart,
  onDragOver: onItemDragOver,
  onDragEnd: onItemDragEnd,
} = useDragSort(computed(() => props.section.items) as any)

const isDragging = computed(() => draggingId.value === props.section.id)

/* ---------------- 条目操作 ---------------- */
function addItem() {
  const blank: ResumeItem = { id: uid('it') }
  if (props.section.type === 'skills') {
    blank.title = '新的技能分组'
    blank.tags = ['技能 1', '技能 2']
  } else if (props.section.type === 'summary') {
    blank.description = ''
  } else if (props.section.type === 'languages') {
    blank.title = '英语'
    blank.extra = 'CET-6'
  } else {
    blank.title = ''
    blank.start = ''
    blank.bullets = ['']
  }
  props.section.items.push(blank)
  expandedId.value = blank.id
  toggleSection(props.section.id, true)
}

function removeItem(id: string) {
  props.section.items = props.section.items.filter((i) => i.id !== id)
}

function duplicateItem(item: ResumeItem) {
  const copy: ResumeItem = JSON.parse(JSON.stringify(item))
  copy.id = uid('it')
  const idx = props.section.items.findIndex((i) => i.id === item.id)
  props.section.items.splice(idx + 1, 0, copy)
  expandedId.value = copy.id
}

function moveItem(item: ResumeItem, dir: -1 | 1) {
  const arr = props.section.items
  const i = arr.findIndex((x) => x.id === item.id)
  const j = i + dir
  if (j < 0 || j >= arr.length) return
  const [it] = arr.splice(i, 1)
  arr.splice(j, 0, it)
}

function removeSection() {
  const id = props.section.id
  resume.value.sections = resume.value.sections.filter((s) => s.id !== id)
  const next = { ...openSections.value }
  delete next[id]
  openSections.value = next
}
</script>

<template>
  <div
    class="group/card relative overflow-hidden rounded-lg border bg-white transition-all"
    :class="[
      isDragging
        ? 'border-brand-border opacity-40'
        : open
          ? 'border-neutral-300 shadow-[0_1px_3px_rgba(16,24,40,0.06)]'
          : 'border-neutral-200 shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:border-neutral-300 hover:shadow-[0_2px_8px_-2px_rgba(16,24,40,0.10)]',
    ]"
    :draggable="true"
    @dragstart="onDragStart(section.id, $event)"
    @dragover="onDragOver(section.id, $event)"
    @dragend="onDragEnd"
    @drop.prevent="onDragEnd"
  >
    <!-- 展开时显示模块主题色（唯一保留的色彩线索） -->
    <span
      class="absolute top-0 bottom-0 left-0 w-[2px] transition-opacity"
      :style="{ background: meta.color, opacity: open ? 1 : 0 }"
    />

    <!-- ============ 头部 ============ -->
    <div class="flex h-11 items-center gap-2 pr-1.5 pl-1.5">
      <span
        class="flex size-5 shrink-0 cursor-grab items-center justify-center rounded text-neutral-300 transition-colors group-hover/card:text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 active:cursor-grabbing"
        title="按住拖动调整顺序"
        @mousedown="arm(section.id)"
      >
        <GripVertical class="size-3.5" />
      </span>

      <component
        :is="meta.icon"
        class="size-[15px] shrink-0 transition-colors"
        :class="open ? '' : 'text-neutral-400'"
        :style="open ? { color: meta.color } : undefined"
        :stroke-width="1.9"
      />

      <input
        v-model="section.title"
        class="min-w-0 flex-1 truncate rounded border border-transparent bg-transparent px-1 py-0.5 text-[13px] font-medium text-neutral-900 outline-none transition-colors hover:border-neutral-200 focus:border-neutral-400"
      />

      <span
        class="shrink-0 text-[11px] tabular-nums"
        :class="visibleCount ? 'text-neutral-400' : 'text-amber-600'"
        :title="`${visibleCount} 条可见 / 共 ${section.items.length} 条`"
        >{{ visibleCount }}/{{ section.items.length }}</span
      >

      <button
        class="flex size-6 shrink-0 items-center justify-center rounded transition-colors hover:bg-neutral-100"
        :class="section.visible ? 'text-neutral-400 hover:text-neutral-700' : 'text-neutral-300'"
        :title="section.visible ? '在简历中隐藏' : '重新显示'"
        @click="section.visible = !section.visible"
      >
        <Eye v-if="section.visible" class="size-3.5" />
        <EyeOff v-else class="size-3.5" />
      </button>

      <button
        class="flex size-6 shrink-0 items-center justify-center rounded text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
        @click="toggleSection(section.id)"
      >
        <ChevronDown class="size-4 transition-transform" :class="open ? '' : '-rotate-90'" />
      </button>
    </div>

    <!-- ============ 展开区 ============ -->
    <div v-show="open" class="border-t border-neutral-200 bg-neutral-50 px-3 pt-3 pb-3.5">
      <!-- 栏位（双栏模板） -->
      <div v-if="twoColumn" class="mb-2.5 flex items-center gap-2">
        <span class="text-[11.5px] text-neutral-400">摆放位置</span>
        <div class="flex gap-1">
          <button
            v-for="c in ['main', 'side'] as const"
            :key="c"
            class="rounded border px-2 py-0.5 text-[11.5px] transition-colors"
            :class="
              section.column === c
                ? 'border-brand bg-brand-soft text-brand-foreground'
                : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300'
            "
            @click="section.column = c"
          >
            {{ c === 'main' ? '主栏' : '侧栏' }}
          </button>
        </div>
      </div>

      <div v-if="!section.items.length" class="py-2 text-[12px] text-neutral-400">
        {{ meta.hint }}
      </div>

      <!-- 条目列表 -->
      <div class="space-y-2">
        <ItemCard
          v-for="(item, i) in section.items"
          :key="item.id"
          :item="item"
          :type="section.type"
          :index="i"
          :total="section.items.length"
          :accent="meta.color"
          :dragging="itemDraggingId === item.id"
          :open="expandedId === item.id"
          @toggle="expandedId = expandedId === item.id ? '' : item.id"
          @up="moveItem(item, -1)"
          @down="moveItem(item, 1)"
          @duplicate="duplicateItem(item)"
          @remove="removeItem(item.id)"
          @arm="armItem(item.id)"
          @dragstart="onItemDragStart(item.id, $event)"
          @dragover="onItemDragOver(item.id, $event)"
          @dragend="onItemDragEnd()"
        />
      </div>

      <!-- 添加条目 -->
      <button
        class="mt-2 flex w-full items-center justify-center gap-1.5 rounded border border-dashed border-neutral-300 bg-white py-2 text-[12.5px] text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-900"
        @click="addItem"
      >
        <Plus class="size-3.5" /> 添加条目
      </button>

      <!-- 模块级操作 -->
      <div class="mt-2.5 flex items-center justify-between">
        <span class="truncate pr-3 text-[11px] text-neutral-400">{{ meta.hint }}</span>
        <button
          class="flex shrink-0 items-center gap-1 rounded px-1.5 py-1 text-[11.5px] text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600"
          @click="removeSection"
        >
          <Trash2 class="size-3" /> 删除模块
        </button>
      </div>
    </div>
  </div>
</template>
