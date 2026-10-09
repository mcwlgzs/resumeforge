<script setup lang="ts">
import { ArrowDown, ArrowUp, ChevronDown, Copy, GripVertical, Trash2 } from 'lucide-vue-next'
import type { ResumeItem, SectionType } from '~/types/resume'

const props = defineProps<{
  item: ResumeItem
  type: SectionType
  index: number
  total: number
  open: boolean
  accent: string
  dragging?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'up'): void
  (e: 'down'): void
  (e: 'duplicate'): void
  (e: 'remove'): void
  (e: 'arm'): void
  (e: 'dragstart', ev: DragEvent): void
  (e: 'dragover', ev: DragEvent): void
  (e: 'dragend'): void
}>()

/** 该模块需要展示的字段 */
const fields = computed(() => {
  switch (props.type) {
    case 'summary':
      return {
        title: false,
        subtitle: false,
        range: false,
        location: false,
        extra: false,
        bullets: false,
        tags: false,
        link: false,
      }
    case 'experience':
      return {
        title: true,
        subtitle: true,
        range: true,
        location: true,
        extra: false,
        bullets: true,
        tags: true,
        link: false,
      }
    case 'projects':
      return {
        title: true,
        subtitle: true,
        range: true,
        location: false,
        extra: false,
        bullets: true,
        tags: true,
        link: true,
      }
    case 'education':
      return {
        title: true,
        subtitle: true,
        range: true,
        location: false,
        extra: true,
        bullets: true,
        tags: false,
        link: false,
      }
    case 'skills':
      return {
        title: true,
        subtitle: false,
        range: false,
        location: false,
        extra: false,
        bullets: false,
        tags: true,
        link: false,
      }
    case 'languages':
      return {
        title: true,
        subtitle: false,
        range: false,
        location: false,
        extra: true,
        bullets: false,
        tags: false,
        link: false,
      }
    case 'awards':
    case 'certificates':
      return {
        title: true,
        subtitle: true,
        range: true,
        location: false,
        extra: false,
        bullets: false,
        tags: false,
        link: false,
      }
    case 'publications':
      return {
        title: true,
        subtitle: true,
        range: true,
        location: false,
        extra: false,
        bullets: false,
        tags: false,
        link: true,
      }
    default:
      return {
        title: true,
        subtitle: true,
        range: true,
        location: true,
        extra: true,
        bullets: true,
        tags: true,
        link: true,
      }
  }
})

const bulletsText = computed({
  get: () => (props.item.bullets ?? []).join('\n'),
  set: (v: string) => {
    props.item.bullets = v.split('\n')
  },
})

const tagsText = computed({
  get: () => (props.item.tags ?? []).join(', '),
  set: (v: string) => {
    props.item.tags = v.split(/[,，、]/).map((s) => s.trim())
  },
})

const labelMap: Record<SectionType, { title: string; subtitle: string }> = {
  summary: { title: '标题', subtitle: '副标题' },
  experience: { title: '职位', subtitle: '公司' },
  projects: { title: '项目名称', subtitle: '角色 / 团队' },
  education: { title: '专业 · 学位', subtitle: '学校' },
  skills: { title: '技能分组', subtitle: '' },
  awards: { title: '奖项名称', subtitle: '颁发机构' },
  certificates: { title: '证书名称', subtitle: '发证机构' },
  publications: { title: '论文标题', subtitle: '期刊 / 会议' },
  languages: { title: '语言', subtitle: '' },
  custom: { title: '标题', subtitle: '副标题' },
}

const labels = computed(() => labelMap[props.type] ?? labelMap.custom)

const summary = computed(() => {
  const it = props.item
  if (props.type === 'summary') return (it.description ?? '').slice(0, 26) || '（点击填写个人简介）'
  if (props.type === 'skills') {
    const t = (it.tags ?? []).filter(Boolean).join('、')
    return [it.title, t].filter(Boolean).join('：').slice(0, 34) || '（未填写技能）'
  }
  const parts = [it.title, it.subtitle].filter(Boolean)
  return parts.join(' · ').slice(0, 40) || '（未命名）'
})

/** 头部副信息：时间范围 / 条数 */
const subInfo = computed(() => {
  const it = props.item
  const parts: string[] = []
  const s = it.start?.trim()
  const e = it.current ? '至今' : (it.end?.trim() ?? '')
  if (s || e) parts.push([s, e].filter(Boolean).join(' — '))
  const bl = (it.bullets ?? []).filter((b) => b.trim()).length
  if (bl) parts.push(`${bl} 条要点`)
  if (it.hidden) parts.push('已隐藏')
  return parts.join(' · ')
})

const barColor = computed(() => props.accent)
</script>

<template>
  <div
    class="group/item relative overflow-hidden rounded-md border bg-white transition-all"
    :class="[
      dragging
        ? 'border-brand-border opacity-40'
        : open
          ? 'border-neutral-300 shadow-[0_1px_3px_rgba(16,24,40,0.06)]'
          : 'border-neutral-200 shadow-[0_1px_2px_rgba(16,24,40,0.03)] hover:border-neutral-300 hover:shadow-[0_2px_8px_-2px_rgba(16,24,40,0.08)]',
      item.hidden && !dragging && 'opacity-50',
    ]"
    :draggable="true"
    @dragstart="emit('dragstart', $event)"
    @dragover="emit('dragover', $event)"
    @dragend="emit('dragend')"
    @drop.prevent="emit('dragend')"
  >
    <!-- 展开时的主题色指示条 -->
    <span
      class="absolute top-0 bottom-0 left-0 w-[2.5px] transition-opacity"
      :style="{ background: barColor, opacity: open ? 1 : 0 }"
    />

    <!-- ============ 头部 ============ -->
    <div class="flex items-center gap-1 py-1.5 pr-1.5 pl-1">
      <!-- 拖拽手柄 -->
      <span
        class="text-neutral-300 flex size-5 shrink-0 cursor-grab items-center justify-center rounded transition-colors hover:bg-neutral-100 hover:text-neutral-600 active:cursor-grabbing"
        title="按住拖动可调整条目顺序"
        @mousedown="emit('arm')"
      >
        <GripVertical class="size-3.5" />
      </span>

      <button class="min-w-0 flex-1 text-left" @click="emit('toggle')">
        <span
          class="block truncate text-[12.5px] font-medium"
          :class="item.hidden ? 'text-neutral-400' : 'text-neutral-800'"
          >{{ summary }}</span
        >
        <span v-if="subInfo" class="text-neutral-400 block truncate text-[10.5px] tabular-nums">
          {{ subInfo }}
        </span>
      </button>

      <div
        class="flex shrink-0 items-center gap-0.5 opacity-45 transition-opacity group-hover/item:opacity-100"
      >
        <button
          class="flex size-6 items-center justify-center rounded text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-25 disabled:hover:bg-transparent"
          :disabled="index === 0"
          title="上移"
          @click="emit('up')"
        >
          <ArrowUp class="size-3.5" />
        </button>
        <button
          class="flex size-6 items-center justify-center rounded text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-25 disabled:hover:bg-transparent"
          :disabled="index === total - 1"
          title="下移"
          @click="emit('down')"
        >
          <ArrowDown class="size-3.5" />
        </button>
        <button
          class="flex size-6 items-center justify-center rounded text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          title="复制此条"
          @click="emit('duplicate')"
        >
          <Copy class="size-3.5" />
        </button>
        <button
          class="flex size-6 items-center justify-center rounded text-neutral-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
          title="删除此条"
          @click="emit('remove')"
        >
          <Trash2 class="size-3.5" />
        </button>
      </div>

      <button
        class="flex size-6 shrink-0 items-center justify-center rounded text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
        @click="emit('toggle')"
      >
        <ChevronDown class="size-3.5 transition-transform" :class="open ? '' : '-rotate-90'" />
      </button>
    </div>

    <!-- ============ 展开区 ============ -->
    <div v-show="open" class="space-y-2.5 border-t border-neutral-200 px-3 py-3">
      <div class="grid grid-cols-2 gap-2">
        <div v-if="fields.title" class="space-y-1" :class="fields.subtitle ? '' : 'col-span-2'">
          <Label class="text-[11px] text-neutral-500">{{ labels.title }}</Label>
          <Input v-model="item.title" class="h-8 text-[13px]" />
        </div>
        <div v-if="fields.subtitle" class="space-y-1">
          <Label class="text-[11px] text-neutral-500">{{ labels.subtitle }}</Label>
          <Input v-model="item.subtitle" class="h-8 text-[13px]" />
        </div>
      </div>

      <div v-if="fields.range || fields.location" class="grid grid-cols-2 gap-2">
        <div v-if="fields.range" class="col-span-2 space-y-1">
          <Label class="text-[11px] text-neutral-500">时间</Label>
          <div class="flex items-center gap-1.5">
            <Input v-model="item.start" class="h-8 text-[13px]" placeholder="2022.03" />
            <span class="text-neutral-400 text-xs">—</span>
            <Input
              v-model="item.end"
              class="h-8 text-[13px]"
              placeholder="2024.06"
              :disabled="item.current"
            />
            <button
              class="shrink-0 rounded-md border px-2 py-1 text-[11px] transition-colors"
              :class="
                item.current
                  ? 'border-brand bg-brand-soft text-brand-foreground'
                  : 'border-neutral-200 text-neutral-500 hover:bg-neutral-100'
              "
              @click="item.current = !item.current"
            >
              至今
            </button>
          </div>
        </div>
        <div v-if="fields.location" class="col-span-2 space-y-1">
          <Label class="text-[11px] text-neutral-500">地点</Label>
          <Input v-model="item.location" class="h-8 text-[13px]" placeholder="上海" />
        </div>
      </div>

      <div v-if="fields.extra" class="space-y-1">
        <Label class="text-[11px] text-neutral-500">补充说明（显示为右侧小字）</Label>
        <Input v-model="item.extra" class="h-8 text-[13px]" placeholder="GPA 3.8/4.0 · 专业前 5%" />
      </div>

      <div v-if="type === 'summary'" class="space-y-1">
        <Label class="text-[11px] text-neutral-500">内容</Label>
        <Textarea
          v-model="item.description"
          class="min-h-24 text-[13px] leading-relaxed"
          placeholder="用 3~4 句话说明你的核心竞争力、擅长的方向与可量化成果。"
        />
      </div>

      <template v-else>
        <div v-if="fields.bullets" class="space-y-1">
          <Label class="text-[11px] text-neutral-500">
            要点 <span class="font-normal text-neutral-400">（每行一条，建议 3~5 条）</span>
          </Label>
          <Textarea
            v-model="bulletsText"
            class="min-h-20 text-[13px] leading-relaxed"
            placeholder="负责核心控制台架构升级，构建产物体积下降 38%&#10;推动单元测试落地，覆盖率提升至 82%"
          />
        </div>

        <div v-if="type === 'custom'" class="space-y-1">
          <Label class="text-[11px] text-neutral-500">描述</Label>
          <Textarea v-model="item.description" class="min-h-16 text-[13px]" />
        </div>

        <div v-if="fields.tags" class="space-y-1">
          <Label class="text-[11px] text-neutral-500">
            标签 <span class="font-normal text-neutral-400">（用逗号分隔）</span>
          </Label>
          <Input v-model="tagsText" class="h-8 text-[13px]" placeholder="Vue 3, Nuxt, TypeScript" />
        </div>

        <div v-if="fields.link" class="space-y-1">
          <Label class="text-[11px] text-neutral-500">链接</Label>
          <Input v-model="item.link" class="h-8 text-[13px]" placeholder="https://github.com/…" />
        </div>
      </template>

      <label
        class="flex cursor-pointer items-center gap-2 rounded-md bg-neutral-50 px-2 py-1.5 text-[12px] text-neutral-600"
      >
        <Switch v-model="item.hidden" />
        在简历中隐藏此条
      </label>
    </div>
  </div>
</template>
