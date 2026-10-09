<script setup lang="ts">
import { ChevronDown, Plus, UserRound } from 'lucide-vue-next'
import type { SectionType } from '~/types/resume'
import { createSection } from '~/composables/useResume'
import { sectionMeta } from '~/utils/sectionMeta'
import { TEMPLATE_MAP } from '~/utils/templates'

const { resume } = useResume()
const { openSections, toggleSection } = useEditor()

const basicsOpen = ref(true)

const twoColumn = computed(() => (TEMPLATE_MAP[resume.value.design.template]?.columns ?? 1) === 2)

/** 首次进入时默认展开前两个模块，避免一屏全是收起的卡片 */
onMounted(() => {
  const next = { ...openSections.value }
  let opened = 0
  for (const s of resume.value.sections) {
    if (next[s.id] === undefined) {
      next[s.id] = opened < 1
      opened++
    }
  }
  openSections.value = next
})

const addableTypes: SectionType[] = [
  'summary',
  'experience',
  'projects',
  'education',
  'skills',
  'awards',
  'certificates',
  'publications',
  'languages',
  'custom',
]

const sideFriendly = ['skills', 'education', 'languages', 'certificates', 'awards']

function addSection(type: SectionType) {
  const sec = createSection(type, twoColumn.value && sideFriendly.includes(type) ? 'side' : 'main')
  resume.value.sections.push(sec)
  toggleSection(sec.id, true)
  nextTick(() => {
    document
      .getElementById(`sec-${sec.id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

const totalItems = computed(() =>
  resume.value.sections.reduce((n, s) => n + s.items.filter((i) => !i.hidden).length, 0),
)
const visibleSections = computed(() => resume.value.sections.filter((s) => s.visible).length)
</script>

<template>
  <div class="space-y-2.5">
    <!-- ============ 基本信息 ============ -->
    <div
      class="overflow-hidden rounded-lg border border-neutral-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_2px_10px_-4px_rgba(15,23,42,0.12)]"
    >
      <button
        class="flex h-12 w-full items-center gap-1.5 pr-2 pl-1 text-left"
        @click="basicsOpen = !basicsOpen"
      >
        <span
          class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-foreground"
        >
          <UserRound class="size-[15px]" :stroke-width="2.1" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-[13.5px] font-semibold text-neutral-800">
            基本信息
          </span>
          <span class="block truncate text-[11px] text-neutral-400">
            {{ resume.basics.name || '未填写姓名' }}
            <template v-if="resume.basics.headline"> · {{ resume.basics.headline }}</template>
          </span>
        </span>
        <ChevronDown
          class="text-neutral-400 size-4 shrink-0 transition-transform"
          :class="basicsOpen ? '' : '-rotate-90'"
        />
      </button>
      <div v-show="basicsOpen" class="border-t border-neutral-100 bg-neutral-50/60 px-2.5 py-2.5">
        <BasicsForm />
      </div>
    </div>

    <!-- ============ 内容统计 ============ -->
    <div v-if="resume.sections.length" class="flex items-center gap-2 px-1 py-0.5">
      <span class="text-neutral-400 text-[11.5px]">
        {{ resume.sections.length }} 个模块 · {{ visibleSections }} 个已启用 ·
        {{ totalItems }} 条内容
      </span>
      <span class="flex-1" />
      <span class="text-neutral-300 text-[11px]">拖动左侧手柄可排序</span>
    </div>

    <!-- ============ 空状态 ============ -->
    <div
      v-if="!resume.sections.length"
      class="rounded-lg border border-dashed border-neutral-300 bg-white/70 px-4 py-8 text-center"
    >
      <div class="text-[13px] font-medium text-neutral-600">简历里还没有任何模块</div>
      <p class="mt-1 text-[11.5px] leading-relaxed text-neutral-400">
        从下方添加「工作经历」「项目经历」等模块，内容会实时出现在右侧预览里。
      </p>
    </div>

    <!-- ============ 模块列表 ============ -->
    <SectionCard
      v-for="sec in resume.sections"
      :id="`sec-${sec.id}`"
      :key="sec.id"
      :section="sec"
      :two-column="twoColumn"
    />

    <!-- ============ 添加模块 ============ -->
    <Popover>
      <PopoverTrigger as-child>
        <button
          class="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-neutral-300 bg-white/60 py-3 text-[13px] font-medium text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-900"
        >
          <Plus class="size-4" /> 添加模块
        </button>
      </PopoverTrigger>
      <PopoverContent align="center" class="w-72 p-1.5">
        <div class="px-2 py-1.5 text-[11px] text-neutral-400">
          选择要加入简历的模块，已有的会标绿
        </div>
        <div class="grid grid-cols-1 gap-0.5">
          <button
            v-for="t in addableTypes"
            :key="t"
            class="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-neutral-100"
            @click="addSection(t)"
          >
            <span
              class="flex size-6 shrink-0 items-center justify-center rounded-md"
              :style="{ background: sectionMeta(t).soft, color: sectionMeta(t).color }"
            >
              <component :is="sectionMeta(t).icon" class="size-3.5" :stroke-width="2.1" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-[12.5px] font-medium text-neutral-700">
                {{ sectionMeta(t).label }}
              </span>
            </span>
            <span
              v-if="resume.sections.some((s) => s.type === t)"
              class="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600"
              >已添加</span
            >
          </button>
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>
