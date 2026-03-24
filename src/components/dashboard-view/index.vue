<script setup lang="ts">

import {DroneBundle} from "@/types";
import {ImagePreview} from "@varlet/ui";

defineProps<{
  obj: DroneBundle,
  hideClose:boolean,
}>();

defineEmits(['close'])

</script>

<template>
  <var-drag
      teleport="#dashboard"
      class="bg-hslSurfaceContainerHighest/50 p3 rounded-xl shadow"
  >
    <div class="flex flex-col relative">
      <var-icon v-if="!hideClose" name="window-close" class="absolute top-0 right-0 hover:cursor-pointer z-12" @click="$emit('close')"/>
      <div class="flex gap-5 items-center relative">
        <div class="w-23 h-25"></div>
        <img title="点击预览" :src="obj.cell?.img" class="hover:cursor-pointer w-25! h-25! max-w-25! max-h-25! object-cover block rounded-2" @click="ImagePreview(obj.cell?.img)"/>
        <div class="flex flex-col gap-5 text-3.5">
          <div class="flex gap-2 items-center">
            <span>型号:{{ obj.cell?.type }}</span>
            <var-badge :type="obj.cell?.is_online?'success':'danger'" dot />
          </div>
          <span :title="obj.sn">sn:{{ obj.sn }}</span>
        </div>
      </div>
      <var-divider />
      <h3 class="m0 py-2">基本信息</h3>
      <div class="flex items-center text-sm my-1" v-for="(v,i) in obj.dashboard?.list" :key="i">
        <span class="w-30">{{ v.label }}:</span>
        <span>{{ v.val+v.unit }}</span>
      </div>
    </div>
  </var-drag>
</template>