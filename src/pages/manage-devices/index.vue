<script setup>
import global from "@/modules/global";
import obj from './index'
import router from '@/modules/router'
</script>

<template>
  <div class="m10 flex flex-col">
    <div class="flex flex-col z-10 bg-body sticky top-0">
      <div class="flex justify-between items-end">
        <div class="flex gap-2 items-center">
          <var-icon name="chevron-left" class="hover:cursor-pointer" @click="router.back()"/>
          <span>设备管理</span>
        </div>
        <div class="flex gap-2 items-end">
          <var-input placeholder="搜索" v-model="obj.input" size="small"/>
          <span class="hover:cursor-pointer hover:color-primary">添加新设备</span>
        </div>
      </div>
      <var-divider />
    </div>
    <div class="flex gap-5 flex-wrap justify-around">
      <div class="var-elevation--2 flex flex-col gap-2 rounded-xl bg-hslSurfaceContainerHighest" v-for="(item,index) in global.devices" :key="index">
        <var-image :src="`/drone/${item.type}.jpg`" radius="12" width="150" fit="cover"/>
        <div class="p-2 flex flex-col gap-2">
          <span>{{item.type}}</span>
          <small>sn:{{item.sn.slice(0,8)}}</small>
          <div class="flex justify-end gap-5 items-center">
            <var-icon name="trash-can-outline" title="删除"/>
            <var-icon name="cog-outline" title="修改"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>