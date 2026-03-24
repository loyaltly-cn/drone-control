<script setup lang="ts">
  defineProps<{
    raw:Uint8Array
  }>()
</script>

<template>
  <div class="w-100% bg-black rounded-xl">
    <p class="flex justify-center">原始数据</p>
    <div class="font-mono text-xs leading-tight flex flex-wrap ">
         <span v-for="(byte, i) in raw" :key="i" class="w-6 text-center" :class="{'inline-block': (i + 1) % 10 !== 0,'block w-full h-0 leading-[0]': (i + 1) % 10 === 0}">
           {{ byte.toString(16).padStart(2, '0').toUpperCase() }}
          <sub class="block text-[8px] text-gray-400">{{ i }}</sub>
        </span>
    </div>
  </div>
</template>