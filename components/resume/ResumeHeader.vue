<script setup lang="ts">
import { Github, Globe, Link2, Mail, MapPin, Phone } from 'lucide-vue-next'
import type { ResumeBasics } from '~/types/resume'

const props = withDefaults(
  defineProps<{
    basics: ResumeBasics
    accent: string
    variant?: 'classic' | 'center' | 'banner' | 'side'
    /** 是否显示联系方式整块 */
    showContacts?: boolean
    /** 联系方式前是否显示图标 */
    showIcons?: boolean
  }>(),
  { variant: 'classic', showContacts: true, showIcons: true },
)

const contacts = computed(() => {
  const b = props.basics
  const list: { key: string; icon: any; text: string; href?: string }[] = []
  if (b.phone) list.push({ key: 'phone', icon: Phone, text: b.phone })
  if (b.email) list.push({ key: 'email', icon: Mail, text: b.email, href: `mailto:${b.email}` })
  if (b.location) list.push({ key: 'loc', icon: MapPin, text: b.location })
  if (b.website)
    list.push({
      key: 'site',
      icon: Globe,
      text: b.website.replace(/^https?:\/\//, ''),
      href: /^https?:\/\//.test(b.website) ? b.website : `https://${b.website}`,
    })
  if (b.github)
    list.push({
      key: 'gh',
      icon: Github,
      text: b.github.replace(/^https?:\/\/(www\.)?github\.com\//, ''),
      href: /^https?:\/\//.test(b.github) ? b.github : `https://${b.github}`,
    })
  if (b.weibo) list.push({ key: 'wb', icon: Link2, text: b.weibo })
  for (const l of b.links ?? []) {
    if (l.value)
      list.push({ key: l.id, icon: Link2, text: `${l.label ? l.label + '：' : ''}${l.value}` })
  }
  return list
})

const banner = computed(() => props.variant === 'banner')
const centered = computed(() => props.variant === 'center')
const hasAvatar = computed(() => props.basics.showAvatar && !!props.basics.avatar)

const avatarRight = computed(() => props.basics.avatarPosition === 'right')

/** 头像基础尺寸（em）× 用户设定的倍率 */
const avatarBoxSize = computed(() => {
  const base = props.variant === 'side' ? 4.6 : 3.6
  const scale = props.basics.avatarSize ?? 1
  return Math.round(base * scale * 100) / 100
})

const avatarRadius = computed(() =>
  props.basics.avatarShape === 'circle'
    ? '999px'
    : props.basics.avatarShape === 'rounded'
      ? '0.5em'
      : '0.12em',
)
</script>

<template>
  <header
    class="rs-header"
    :class="[banner && 'rs-header-banner']"
    :style="{ '--rs-accent': accent }"
  >
    <div
      class="flex gap-[0.9em]"
      :class="[
        centered ? 'flex-col items-center text-center' : 'items-center',
        // 头像靠右：翻转主轴顺序；文字块仍是左对齐（flex-1 撑满剩余空间）
        !centered && hasAvatar && avatarRight ? 'flex-row-reverse' : '',
      ]"
    >
      <img
        v-if="hasAvatar"
        :src="basics.avatar"
        alt="头像"
        class="shrink-0 object-cover"
        :style="{
          width: `${avatarBoxSize}em`,
          height: `${avatarBoxSize}em`,
          borderRadius: avatarRadius,
        }"
      />
      <div class="min-w-0 flex-1" :class="!centered && avatarRight ? 'text-left' : ''">
        <h1 class="rs-name" :style="{ fontSize: '2.05em' }">
          {{ basics.name || '你的姓名' }}
        </h1>
        <p v-if="basics.headline" class="rs-headline mt-[0.18em]" :style="{ fontSize: '1.03em' }">
          {{ basics.headline }}
        </p>

        <div
          v-if="showContacts && contacts.length"
          class="rs-contacts mt-[0.5em] flex flex-wrap gap-x-[0.85em] gap-y-[0.18em]"
          :class="centered ? 'justify-center' : ''"
          :style="{ fontSize: '0.92em' }"
        >
          <span
            v-for="c in contacts"
            :key="c.key"
            class="inline-flex items-center gap-[0.3em] whitespace-nowrap"
          >
            <component
              :is="c.icon"
              v-if="showIcons && c.icon"
              class="rs-contact-icon shrink-0"
              :size="11"
              :stroke-width="2"
            />
            <a
              v-if="c.href"
              :href="c.href"
              target="_blank"
              rel="noreferrer noopener"
              class="hover:underline"
              >{{ c.text }}</a
            >
            <span v-else>{{ c.text }}</span>
          </span>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* 层级用明确的灰度表达，而非文字透明度 */
.rs-name {
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.022em;
  color: #0f172a;
}
.rs-headline {
  line-height: 1.35;
  color: #4b5563;
}
.rs-contacts {
  line-height: 1.4;
  color: #4b5563;
}
.rs-contact-icon {
  color: #9ca3af;
}

/* 色带页眉：铺满整宽，文字转为白色系 */
.rs-header-banner {
  margin: -1.2em -1.4em 0;
  padding: 1.15em 1.4em 1.1em;
  background: var(--rs-accent);
  color: #ffffff;
}
.rs-header-banner .rs-name {
  color: #ffffff;
}
.rs-header-banner .rs-headline,
.rs-header-banner .rs-contacts {
  color: rgba(255, 255, 255, 0.88);
}
.rs-header-banner .rs-contact-icon {
  color: rgba(255, 255, 255, 0.72);
}
</style>
