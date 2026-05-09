<script setup lang="ts">
import { ref } from 'vue'
import {DroneCoreData} from "@/modules/core";
import {UomRepBody} from "@/types";
const props = defineProps<DroneCoreData>()
defineEmits(['line'])
const loading = ref(false)
const uom = () =>{
  loading.value = true
  fetch(`https://uom.caac.gov.cn/api/home/anon/uavRegistShow/sn/${props.sn}`).then(res => res.json())  // 解析 JSON
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
      }).finally(() => loading.value = false)
}
</script>

<template>
  <div class="flex flex-col">
    <var-image :src="`/drone/${name}.jpg`" :radius="10" fit="cover" width="150" height="80"/>
    <small class="mt-1">{{name}}</small>
    <small class="text-gray-500 text-sm pt-1">sn:{{sn}}</small>
    <var-divider hairline/>
    <small>位置: {{lng.toFixed(6)}},{{lat.toFixed(6)}}</small>
    <small>地速: {{speed}}m/s</small>
    <small>航迹角: {{heading}}°</small>
    <small>垂直速度: {{altitude_speed.toFixed(2)}}m/s</small>
    <small>距地高度: {{altitude.toFixed(2)|| 0}}m</small>
    <small>气压高度: {{pressure_altitude.toFixed(2)}}m</small>
    <small>几何高度: {{geometric_height.toFixed(2)}}m</small>
    <small>控制器纬度: {{con_lat?.toFixed(6)}}</small>
    <small>控制器经度: {{con_lng?.toFixed(6)}}</small>
    <small>运行区域半径: {{radius?.toFixed(2)}}</small>
    <small>运行区域高度上限: {{max?.toFixed(2)}}</small>
    <small>运行区域高度下限: {{min?.toFixed(2)}}</small>
    <var-divider hairline/>
    <div class="flex justify-between gap-5">
      <var-button class="text-black" type="primary" size="mini" @click="$emit('line',sn)">观察运动轨迹</var-button>
      <var-button class="text-black" type="primary" size="mini" :loading="loading" @click="uom()">uom信息</var-button>
    </div>
  </div>
</template>