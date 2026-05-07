<template>
  <div
      :class="['inline-flex flex-col items-center justify-center cursor-pointer', customClass]"
      @click="copyName"
  >
    <svg
        :width="size"
        :height="size"
        viewBox="0 0 24 24"
        fill="currentColor"
    >
      <path :d="path" />
    </svg>
    <span v-if="showName" class="text-xs text-center break-all">{{ name }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import * as mdi from '@mdi/js'

interface Props {
  name: string             // 小写破折号风格，例如 'motion-pause-outline'
  size?: number | string
  color?: string
  customClass?: string
  showName?: boolean
  copyOnClick?: boolean
}

const props = defineProps<Props>()

const path = ref('')
const copied = ref(false)
const size = props.size || 24

// 工具函数：小写破折号 → PascalCase → mdiKey
function toMdiKey(name: string) {
  return 'mdi' + name
      .split(/[-_]/g)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')
}

// 监听 name 更新 path
watchEffect(() => {
  const key = toMdiKey(props.name)
  path.value = (mdi as Record<string, string>)[key] || ''
})

// 点击复制图标名称
function copyName() {
  if (!props.copyOnClick) return
  navigator.clipboard?.writeText(props.name).then(() => {
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  }).catch(() => {
    console.warn('复制失败')
  })
}
</script>