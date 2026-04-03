<script setup lang="ts">

import {DroneBundle, UomRepBody} from "@/types";
import {Dialog, ImagePreview} from "@varlet/ui";

const props = defineProps<{
  obj: DroneBundle,
  hideClose:boolean,
}>();

defineEmits(['close'])
const loading = ref(false)
const uom = () =>{
  loading.value = true
  fetch(`https://uom.caac.gov.cn/api/home/anon/uavRegistShow/sn/${props.obj.sn}`).then(res => res.json())  // 解析 JSON
      .then((data:UomRepBody) => {
        const {xingm,shoujhm} = data.uomUavRegist
        let str = '未注册'
        if (xingm && shoujhm) str = `注册名称:${xingm} - 联系方式:${shoujhm}`
        Dialog({
          title:'uom信息',
          message:str
        })
      })
      .catch(err => {
        console.error('请求失败:', err)
      })
}
</script>

<template>
  <div class="flex flex-col absolute left-2 top-2 bg-hslSurfaceContainerHighest/50 p3 rounded-xl shadow">
    <div class="flex gap-5 items-center relative">
      <var-icon name="window-close" class="absolute right-0 top-0 hover:cursor-pointer hover:color-danger" @click="$emit('close')"/>
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
    <div class="flex items-center text-sm my-1">
      <span class="w-30">uom信息:</span>
      <span class="text-primary hover:cursor-pointer" @click="uom">点击查看</span>
    </div>
  </div>
</template>