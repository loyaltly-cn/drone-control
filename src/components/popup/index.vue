<script setup lang="ts">
import { ref } from 'vue'
import {DroneCoreData} from "@/modules/core";
import {UomRepBody} from "@/types";
const props = defineProps<DroneCoreData>()

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
      })
}
</script>

<template>
  <div class="flex flex-col">
    <var-image :src="`/drone/${name}.jpg`" :radius="10" fit="cover" width="150" height="80"/>
    <span class="mt-1">{{name}}</span>
    <span class="text-gray-500 text-sm pt-1">sn:{{sn}}</span>
    <var-divider hairline/>
    <span>经度: {{lng.toFixed(6)}}</span>
    <span>纬度: {{lat.toFixed(6)}}</span>
    <span>地速: {{speed}}m/s</span>
    <span>航迹角: {{heading}}°</span>
    <span>垂直速度: {{altitude_speed || 0}}m/s</span>
    <span>距地高度: {{altitude|| 0}}m</span>
    <span>气压高度: {{pressure_altitude|| 0}}m</span>
    <span>几何高度: {{geometric_height|| 0}}m</span>
    <span>控制器纬度: {{con_lat}}</span>
    <span>控制器经度: {{con_lng}}</span>
    <span>运行区域半径: {{radius}}</span>
    <span>运行区域高度上限: {{max}}</span>
    <span>运行区域高度下限: {{min}}</span>
    <var-divider hairline/>
    <div class="flex justify-between gap-5">
      <var-button class="text-white" type="primary" size="mini">观察轨迹并录制</var-button>
      <var-button class="text-white" type="primary" size="mini" @click="uom()">uom信息</var-button>
    </div>
  </div>
</template>