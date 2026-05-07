<script setup lang="ts">
import {buttons} from './render'
import {CoreSource} from "@/modules/core";
  defineProps({
    connect:{
      type: Boolean,
      default: false
    },
    pause:{
      type: Boolean,
      default: false
    },
    source:{
      type:String as () => CoreSource,
      default:'websocket'
    }
  })
  defineEmits(['change'])
  const maps = {
    websocket: {
      text:'网络',
      icon:'access-point-network'
    },
    serial:{
      text:'串口',
      icon:'serial-port'
    },
    unknown:{
      text:'未知',
      icon:'bug'
    }
  }
</script>

<template>
  <div class="fixed bottom-2 left-0 right-0 flex justify-center">
    <div class="text-sm flex items-center mx-2 px-5 py-2 bg-surfaceContainerHighest/90 backdrop-blur-lg rounded-12 z-10 transition-all duration-300 ease-in-out w-auto min-w-fit">

     <div class="flex gap-1 items-center">
        <md-icon name="devices" size="15"/>
        <var-badge :type="connect?'success':'danger'" dot/>
        <var-button :elevation="false" size="mini" :type="connect?'danger':'success'" @click="$emit('change','connect')">{{ connect?'断开':'连接' }}</var-button>
      </div>
      <var-divider vertical/>
      <div class="flex gap-1 items-center cursor-pointer hover:text-primary" v-if="connect" @click="$emit('change','pause')">
        <md-icon :name="pause?'motion-pause-outline':'motion-play-outline'" size="15"/>
        <span class="text-sm">{{pause?'继续':'暂停'}}</span>
      </div>

      <div class="flex gap-1 items-center cursor-pointer hover:text-primary" v-if="!connect" @click="$emit('change','db')">
        <md-icon name="database-import-outline" size="15"/>
        <span class="text-sm">来源:{{maps[source].text}}</span>
        <md-icon :name="maps[source].icon" size="15"/>
      </div>
      <template v-for="(item,index) in buttons" :key="index">
        <var-divider vertical/>
        <div class="flex gap-1 items-center cursor-pointer hover:text-primary" @click="$emit('change',item.emit)">
          <md-icon :name="item.icon" size="15"/>
          <span class="text-sm">{{item.text}}</span>
        </div>
      </template>

    </div>
  </div>
</template>