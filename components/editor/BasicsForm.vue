<script setup lang="ts">
import { ImagePlus, Link2, Plus, Trash2 } from 'lucide-vue-next'
import { compressImage } from '~/utils/image'

const { resume } = useResume()
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

async function onPick(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  try {
    resume.value.basics.avatar = await compressImage(file, 480, 0.9)
    resume.value.basics.showAvatar = true
  } finally {
    uploading.value = false
    ;(e.target as HTMLInputElement).value = ''
  }
}

function addLink() {
  resume.value.basics.links.push({ id: uid('lk'), label: '', value: '' })
}
function removeLink(id: string) {
  resume.value.basics.links = resume.value.basics.links.filter((l) => l.id !== id)
}

const radius = computed(() => {
  const s = resume.value.basics.avatarShape
  return s === 'circle' ? '999px' : s === 'rounded' ? '8px' : '3px'
})

/** Slider 的 modelValue 是数组，这里包一层 */
const avatarSizeModel = computed({
  get: () => [resume.value.basics.avatarSize ?? 1],
  set: (v: number[] | number) => {
    const raw = Array.isArray(v) ? v[0] : Number(v)
    if (typeof raw === 'number' && !Number.isNaN(raw)) resume.value.basics.avatarSize = raw
  },
})

const avatarSizePercent = computed(() => Math.round((resume.value.basics.avatarSize ?? 1) * 100))
</script>

<template>
  <div class="space-y-4">
    <!-- ============ 头像 ============ -->
    <div class="space-y-2.5 rounded-lg border border-neutral-200/90 bg-white p-2.5">
      <div class="flex items-center gap-3">
        <button
          class="group relative size-14 shrink-0 overflow-hidden border border-dashed border-neutral-300 transition-colors hover:border-neutral-400"
          :style="{ borderRadius: radius }"
          title="点击上传照片"
          @click="fileInput?.click()"
        >
          <img
            v-if="resume.basics.avatar"
            :src="resume.basics.avatar"
            class="size-full object-cover"
            alt="头像"
          />
          <span class="text-neutral-400 flex size-full items-center justify-center bg-neutral-50">
            <ImagePlus class="size-4" />
          </span>
          <span
            class="absolute inset-0 hidden items-center justify-center bg-black/45 text-[10px] font-medium text-white group-hover:flex"
          >
            {{ uploading ? '处理中' : resume.basics.avatar ? '更换' : '上传' }}
          </span>
        </button>

        <div class="min-w-0 flex-1">
          <label class="flex cursor-pointer items-center gap-2">
            <Switch v-model="resume.basics.showAvatar" />
            <span class="text-[12.5px] text-neutral-700">在简历中显示照片</span>
          </label>
          <p class="mt-1.5 text-[11px] leading-relaxed text-neutral-400">
            技术、设计类岗位通常不放照片，把空间留给内容。
          </p>
        </div>
      </div>

      <!-- 仅在显示照片时才有意义的设置 -->
      <div
        v-if="resume.basics.showAvatar"
        class="space-y-2.5 border-t border-neutral-100 pt-2.5"
      >
        <div class="flex items-center gap-2">
          <span class="w-8 shrink-0 text-[11.5px] text-neutral-400">形状</span>
          <div class="flex gap-1">
            <button
              v-for="s in ['circle', 'rounded', 'square'] as const"
              :key="s"
              class="rounded-md border px-2 py-0.5 text-[11.5px] transition-colors"
              :class="
                resume.basics.avatarShape === s
                  ? 'border-brand bg-brand-soft text-brand-foreground'
                  : 'border-neutral-200 text-neutral-500 hover:bg-neutral-100'
              "
              @click="resume.basics.avatarShape = s"
            >
              {{ s === 'circle' ? '圆形' : s === 'rounded' ? '圆角' : '方形' }}
            </button>
          </div>
          <button
            v-if="resume.basics.avatar"
            class="ml-auto rounded-md px-2 py-0.5 text-[11px] text-neutral-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
            @click="resume.basics.avatar = ''"
          >
            移除
          </button>
        </div>

        <div class="flex items-center gap-2">
          <span class="w-8 shrink-0 text-[11.5px] text-neutral-400">位置</span>
          <div class="flex gap-1">
            <button
              v-for="p in ['left', 'right'] as const"
              :key="p"
              class="rounded-md border px-2 py-0.5 text-[11.5px] transition-colors"
              :class="
                (resume.basics.avatarPosition ?? 'left') === p
                  ? 'border-brand bg-brand-soft text-brand-foreground'
                  : 'border-neutral-200 text-neutral-500 hover:bg-neutral-100'
              "
              @click="resume.basics.avatarPosition = p"
            >
              {{ p === 'left' ? '靠左' : '靠右' }}
            </button>
          </div>
          <span class="ml-auto text-[10.5px] text-neutral-400">居中版式下不生效</span>
        </div>

        <div class="flex items-center gap-2">
          <span class="w-8 shrink-0 text-[11.5px] text-neutral-400">大小</span>
          <Slider v-model="avatarSizeModel" :min="0.6" :max="2" :step="0.05" class="flex-1" />
          <span class="w-9 shrink-0 text-right text-[11.5px] tabular-nums text-neutral-500">
            {{ avatarSizePercent }}%
          </span>
        </div>
      </div>

      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onPick" />
    </div>

    <!-- ============ 基本身份 ============ -->
    <section class="space-y-2.5">
      <h4
        class="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-neutral-400"
      >
        <span class="h-3 w-[2px] rounded-full bg-brand" />
        基本身份
      </h4>
      <div class="space-y-1.5">
        <Label class="text-[11.5px] text-neutral-500">姓名</Label>
        <Input v-model="resume.basics.name" class="h-9 text-[13.5px]" placeholder="张三" />
      </div>
      <div class="space-y-1.5">
        <Label class="text-[11.5px] text-neutral-500">求职意向 / 一句话定位</Label>
        <Input
          v-model="resume.basics.headline"
          class="h-9 text-[13.5px]"
          placeholder="高级前端工程师 · Vue / Nuxt 方向"
        />
      </div>
    </section>

    <!-- ============ 联系方式 ============ -->
    <section class="space-y-2.5">
      <h4
        class="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-neutral-400"
      >
        <span class="h-3 w-[2px] rounded-full bg-emerald-500" />
        联系方式
      </h4>
      <div class="grid grid-cols-2 gap-2">
        <div class="space-y-1.5">
          <Label class="text-[11.5px] text-neutral-500">手机</Label>
          <Input
            v-model="resume.basics.phone"
            class="h-9 text-[13.5px]"
            placeholder="138 0000 0000"
          />
        </div>
        <div class="space-y-1.5">
          <Label class="text-[11.5px] text-neutral-500">邮箱</Label>
          <Input
            v-model="resume.basics.email"
            class="h-9 text-[13.5px]"
            placeholder="name@example.com"
          />
        </div>
      </div>
      <div class="space-y-1.5">
        <Label class="text-[11.5px] text-neutral-500">所在城市</Label>
        <Input
          v-model="resume.basics.location"
          class="h-9 text-[13.5px]"
          placeholder="上海 · 浦东新区"
        />
      </div>
    </section>

    <!-- ============ 在线链接 ============ -->
    <section class="space-y-2.5">
      <h4
        class="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-neutral-400"
      >
        <span class="h-3 w-[2px] rounded-full bg-neutral-800" />
        在线链接
      </h4>
      <div class="grid grid-cols-2 gap-2">
        <div class="space-y-1.5">
          <Label class="text-[11.5px] text-neutral-500">个人网站</Label>
          <Input
            v-model="resume.basics.website"
            class="h-9 text-[13.5px]"
            placeholder="mysite.dev"
          />
        </div>
        <div class="space-y-1.5">
          <Label class="text-[11.5px] text-neutral-500">GitHub</Label>
          <Input
            v-model="resume.basics.github"
            class="h-9 text-[13.5px]"
            placeholder="github.com/you"
          />
        </div>
      </div>
      <div class="space-y-1.5">
        <Label class="text-[11.5px] text-neutral-500">微博 / 作品集</Label>
        <Input v-model="resume.basics.weibo" class="h-9 text-[13.5px]" placeholder="选填" />
      </div>

      <div class="flex items-center justify-between pt-0.5">
        <span class="text-[11.5px] text-neutral-400">自定义链接</span>
        <button
          class="flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] text-neutral-900 transition-colors hover:bg-neutral-100"
          @click="addLink"
        >
          <Plus class="size-3" /> 添加
        </button>
      </div>

      <div
        v-for="l in resume.basics.links"
        :key="l.id"
        class="flex items-center gap-1.5 rounded-lg border border-neutral-200/90 bg-white p-1.5"
      >
        <Link2 class="text-neutral-300 size-3.5 shrink-0" />
        <Input v-model="l.label" class="h-7 w-20 shrink-0 text-[12.5px]" placeholder="标签" />
        <Input v-model="l.value" class="h-7 text-[12.5px]" placeholder="链接或说明" />
        <button
          class="flex size-6 shrink-0 items-center justify-center rounded text-neutral-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
          @click="removeLink(l.id)"
        >
          <Trash2 class="size-3.5" />
        </button>
      </div>

      <p v-if="!resume.basics.links.length" class="text-[11px] leading-relaxed text-neutral-400">
        例如「掘金：juejin.cn/user/xxx」「作品集：behance.net/xxx」
      </p>
    </section>
  </div>
</template>
