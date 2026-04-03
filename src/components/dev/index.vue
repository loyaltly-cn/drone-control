<script setup lang="ts">
defineProps({
  raw:{
    type:Uint8Array,
    default:[]
  },
  show:{
    type:Boolean,
    default:false
  }
})
</script>

<template>
  <var-drag class="rounded-xl shadow flex flex-col gap-2 bg-hslSurfaceContainerHighest z-20 p-5 w-500px h-500px" teleport="#dev" v-if="show">
    <h3 class="m0 py-2 flex justify-center">开发者模式</h3>
    <var-divider />
    <dev-bin-data :raw="raw"/>
    <var-icon name="window-close" class="absolute top-5 right-5 hover:cursor-pointer z-12"/>
  </var-drag>
</template>