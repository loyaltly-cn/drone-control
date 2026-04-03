<script setup lang="ts">
import even from "@pages/home/even.ts";
import render from "./render";
import pinia from "@/modules/pinia";

defineProps({
  show:{
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <var-popup v-model:show="show" :defaultStyle="false">
    <div class="p3 rounded-2 bg-hslSurfaceContainerHighest w-50">
      <h3 class="flex justify-center">系统设置</h3>
      <var-cell border>
        <template #default>主题</template>
        <template #extra>
          <var-menu-select @select="even.handleSelect">
            <var-icon name="chevron-down" />
            <template #options>
              <var-menu-option v-for="(v,i) in render.theme" :label="v.label" :value="v.value" :index="i" />
            </template>
          </var-menu-select>
        </template>
      </var-cell>

      <var-cell border v-if="pinia().dev">
        <template #default>
          开发者选项
        </template>
        <template #extra>
          <var-icon name="chevron-right" @click="even.open_dev()"/>
        </template>
      </var-cell>
    </div>
  </var-popup>
</template>