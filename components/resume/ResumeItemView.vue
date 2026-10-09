<script setup lang="ts">
import type { ResumeItem } from '~/types/resume'

const props = defineProps<{
  item: ResumeItem
  accent: string
  showDivider?: boolean
  /** 技能类条目的展示方式 */
  skillStyle?: 'tags' | 'bars'
}>()

const range = computed(() => {
  const s = props.item.start?.trim()
  const e = props.item.current ? '至今' : (props.item.end?.trim() ?? '')
  if (!s && !e) return ''
  if (s && e) return `${s} — ${e}`
  return s || e
})

const bullets = computed(() => (props.item.bullets ?? []).map((b) => b.trim()).filter(Boolean))
const tags = computed(() => (props.item.tags ?? []).map((t) => t.trim()).filter(Boolean))

const isSkillRow = computed(
  () =>
    (props.item.level ?? 0) > 0 ||
    (!!props.item.title &&
      tags.value.length > 0 &&
      !props.item.subtitle &&
      !props.item.description &&
      !bullets.value.length),
)
</script>

<template>
  <div class="rs-item">
    <!-- 技能型：分组名 + 顿号分隔的技能项 -->
    <template v-if="isSkillRow">
      <div class="flex items-baseline gap-[0.6em]">
        <span class="rs-skill-label">{{ item.title }}</span>
        <span v-if="tags.length" class="rs-inline-tags">
          <span v-for="t in tags" :key="t">{{ t }}</span>
        </span>
      </div>
    </template>

    <template v-else>
      <!-- 首行：职位 / 项目名 + 时间 · 地点（两端对齐） -->
      <div
        v-if="item.title || range || item.location"
        class="flex items-baseline justify-between gap-[1em]"
      >
        <div class="flex min-w-0 items-baseline gap-[0.5em]">
          <span class="rs-title">{{ item.title }}</span>
          <span v-if="item.subtitle" class="rs-org">{{ item.subtitle }}</span>
        </div>
        <span v-if="range || item.location" class="rs-range">
          <template v-if="range">{{ range }}</template>
          <span v-if="range && item.location" class="rs-range-sep">·</span>
          <template v-if="item.location">{{ item.location }}</template>
        </span>
      </div>

      <!-- 次级信息 -->
      <div v-if="item.extra || item.link" class="rs-meta">
        <span v-if="item.extra">{{ item.extra }}</span>
        <a
          v-if="item.link"
          :href="item.link"
          target="_blank"
          rel="noreferrer noopener"
          class="break-all"
          >{{ item.link.replace(/^https?:\/\//, '') }}</a
        >
      </div>

      <!-- 描述 -->
      <p v-if="item.description" class="rs-desc">{{ item.description }}</p>

      <!-- 要点：悬挂缩进，符号与首行基线对齐 -->
      <ul v-if="bullets.length" class="rs-bullets">
        <li v-for="(b, i) in bullets" :key="i">
          <span class="rs-dot" :style="{ background: accent }" />
          <span class="rs-bullet-text">{{ b }}</span>
        </li>
      </ul>

      <!-- 标签：用间隔点而非彩色底，避免简历出现色块 -->
      <div v-if="tags.length" class="rs-inline-tags rs-tags-line">
        <span v-for="t in tags" :key="t">{{ t }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* 层次靠明确的灰度，而不是文字透明度——后者在打印/截图时不可控 */
.rs-title {
  font-weight: 600;
  color: #111827;
}
.rs-org {
  color: #4b5563;
}
.rs-range {
  flex-shrink: 0;
  font-size: 0.92em;
  color: #6b7280;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
/* 时间与地点之间的间隔点 */
.rs-range-sep {
  margin: 0 0.35em;
  color: #d4d4d8;
}
.rs-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0 0.85em;
  margin-top: 0.1em;
  font-size: 0.9em;
  color: #6b7280;
}
.rs-meta a {
  color: inherit;
  text-decoration: underline;
  text-decoration-style: dotted;
  text-underline-offset: 0.15em;
}
.rs-desc {
  margin-top: 0.28em;
  color: #374151;
  white-space: pre-line;
  /* 不用 text-justify：中英混排会撑出难看的字间隙 */
  text-align: left;
}
.rs-bullets {
  display: flex;
  flex-direction: column;
  gap: 0.16em;
  margin-top: 0.3em;
}
.rs-bullets li {
  display: flex;
  align-items: baseline;
  gap: 0.5em;
}
.rs-dot {
  flex-shrink: 0;
  width: 0.26em;
  height: 0.26em;
  border-radius: 50%;
  transform: translateY(-0.18em);
}
.rs-bullet-text {
  min-width: 0;
  flex: 1;
  color: #374151;
  text-align: left;
}

/* 技能 / 技术栈：纯文本 + 间隔点 */
.rs-skill-label {
  flex-shrink: 0;
  font-weight: 600;
  color: #111827;
}
.rs-inline-tags {
  color: #4b5563;
}
.rs-inline-tags span + span::before {
  content: ' · ';
  color: #9ca3af;
}
.rs-tags-line {
  margin-top: 0.3em;
  font-size: 0.93em;
}
</style>
