<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">MDI 图标大全</h1>
    <div class="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-4">
      <div
          v-for="icon in iconList"
          :key="icon.name"
          class="flex flex-col items-center p-2 border rounded cursor-pointer
               text-color-text hover:text-color-primary transition-colors duration-200"
          @click="copyIconName(icon.name)"
      >
        <Icon>
          <svg viewBox="0 0 24 24" class="w-6 h-6 text-current mb-1">
            <path :d="icon.path" fill="currentColor" />
          </svg>
        </Icon>
        <span class="text-xs break-all text-center">{{ icon.name }}</span>
      </div>
    </div>
    <p v-if="copied" class="mt-2 text-green-600">图标名称已复制: {{ copied }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import * as mdi from '@mdi/js'

// 工具函数：PascalCase → 小写破折号
function pascalToKebab(str: string) {
  return str
      .replace(/^mdi/, '')        // 去掉前缀
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2') // 分割驼峰
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2') // 连续大写分割
      .toLowerCase()
}

// 生成图标列表
const iconList = Object.keys(mdi).map(key => ({
  name: pascalToKebab(key),
  path: (mdi as Record<string, string>)[key]
}))

const copied = ref('')

// 复制图标名称
async function copyIconName(name: string) {
  try {
    await navigator.clipboard.writeText(name)
    copied.value = name
    setTimeout(() => {
      copied.value = ''
    }, 2000)
  } catch (err) {
    console.error('复制失败', err)
  }
}
</script>