<script setup>
  import { 
    BMap,
    BZoom, 
    BLocation,
    BMarker,
    BNavigation3d,
} from 'vue3-baidu-map-gl'
    import obj from './index'
    import even from './even'
    import render from './render'
    import pinia from "@/modules/pinia";
    import utils from "@/modules/utils";
    const init = e => even.init(e)
</script>
<template>
    <div id="dashboard"/>
    <div id="dev"/>
    <div id="test"/>
    <div class="w-full h-screen relative overflow-hidden scrollbar-hide">
      <BMap :ak="pinia().baidu_ak" height="100%" enableScrollWheelZoom enableDoubleClickZoom @initd="init">
        <!-- default 模式 -->
        <div v-if="obj.mode === 'default'" v-for="(item, index) in obj.list" :key="index">
          <BMarker
              v-if="item.cell.show_map"
              :key="item.sn"
          :position="{ lng: item.map.lng, lat: item.map.lat }"
          :icon="utils.getDroneIcon(item.map.color)"
          />
        </div>
        <BLocation anchor="BMAP_ANCHOR_BOTTOM_RIGHT" />
        <BZoom :offset="{ x: 28, y: 70 }"/>
        <BNavigation3d anchor="BMAP_ANCHOR_BOTTOM_RIGHT" :offset="{ x: 15, y: 130 }" />
      </BMap>
    </div>

    <div v-if="obj.mode === 'default'" class="flex flex-col gap-2 text-sm fixed top-1 right-1 bg-hslSurfaceContainerHighest rounded-2xl z-10 min-w-50 h-60% md3-scroll">
        <div class="flex px-2 pt-5 flex-col sticky top-0 z-1 bg-hslSurfaceContainerHighest">    
            <div class="flex gap-5 justify-between items-center">
                <h3 class="my-0">无人机列表</h3>
                <div class="flex gap-1 items-center">
                  <var-badge dot type="success"/>
                  <small>在线:{{obj.stats.online}}</small>
                </div>
                <div class="flex gap-1 items-center">
                  <var-badge dot type="danger"/>
                  <small>离线:{{obj.stats.offline}}</small>
                </div>
            </div>
            <var-divider/>
        </div>

        <TransitionGroup name="transition-list" tag="div">
          <var-cell v-for="(item,index) in obj.list" :key="item.sn" :description="item.sn" border>
            <template #default>
              <var-badge :type="item.cell.is_online?'success':'danger'" dot />
              {{ item.cell.type }}
            </template>
            <template #extra>
              <div class="flex gap-1">
                <var-icon v-if="item.cell.show_map" name="map-marker-radius-outline" @click="even.jump_to_drone_for_map(index)"/>
                <var-icon :transition="30" :color="item.cell.show_map?'var(--color-primary)':''" :name="item.cell.show_map?'map-marker-radius':'map-marker-radius-outline'" @click="even.change_drone_map_show(index)"/>
                <var-icon name="dots-vertical" :color="item.cell.show_dashboard?'var(--color-primary)':''"  :name="item.cell.show_dashboard?'dots-vertical':'dots-vertical-outline'" @click="even.change_drone_dashboard_show(index)"/>
              </div>
            </template>
          </var-cell>
        </TransitionGroup>
    </div>

    <div class="text-sm flex gap-5 items-center fixed bottom-5 left-20 px-5 py-2 bg-hslSurfaceContainerHighest/90 rounded-12 z-10 transition-all duration-300 ease-in-out w-auto min-w-fit">
        <div class="flex gap-2 items-center">
            <var-badge :type="obj.state.connect?'success':'danger'" dot />
            <small>设备状态: {{obj.state.connect?'已连接':'未连接' }}</small>
            <var-button :elevation="false" size="mini" :type="obj.state.connect?'danger':'success'" @click="even.change_connect_button">{{ obj.state.connect?'断开':'连接' }}</var-button>
        </div>
        <span v-if="obj.mode === 'default'">无人机总数量{{obj.stats.total}}</span>
        <span class="hover:cursor-pointer hover:color-primary" v-if="obj.mode === 'record'" @click="even.toggle()">{{obj.state.record?'暂停':'继续'}}</span>
        <span class="hover:cursor-pointer hover:color-primary" v-for="(item,index) in obj.bar_button" :key="index" @click="item.func">{{item.label}}</span>
    </div>

    <template v-if="obj.mode === 'default'" v-for="(item,index) in obj.list">
      <dashboard-view :obj="item" v-if="item.cell.show_dashboard" :key="item.lastUpdate" @close="even.change_drone_dashboard_show(index)"/>
    </template>

    <dashboard-view  v-if="obj.mode === 'record' && obj.record_drone.lastUpdate" :key="obj.record_drone.lastUpdate" :obj="obj.record_drone"/>

    <var-popup v-model:show="obj.state.popup.setting" :default-style="false">
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

    <var-popup v-model:show="obj.state.popup.record" :default-style="false">
      <div class="p3 rounded-2 bg-body">
        <h3 class="flex justify-center m2">请选择要录制的设备</h3>
        <div class="gap-2 grid grid-cols-4 max-w-80vw">
          <template v-for="(item,index) in obj.list" :key="index">
            <div v-if="item.cell.is_online" class="var-elevation--2 flex flex-col gap-2 rounded-xl bg-hslSurfaceContainerHighest hover:cursor-pointer hover:scale-105 transition-transform duration-300" @click="even.ready_record(item.sn)">
              <img :src="item.cell.img" class="w-30! h-25! max-w-30! max-h-25! object-cover block rounded-2"/>
              <div class="p-2 flex flex-col">
                <span class="text-sm">{{item.cell.type}}</span>
                <small class="text-2">sn:{{item.sn}}</small>
              </div>
            </div>
          </template>
        </div>
      </div>
    </var-popup>

    <var-popup v-model:show="obj.state.popup.replay" :default-style="false">
      <div class="p3 rounded-2 bg-hslSurfaceContainerHighest">
        <h3 class="flex justify-center">轨迹回放</h3>

      </div>
    </var-popup>

    <var-drag class="rounded-xl shadow flex flex-col gap-2 bg-hslSurfaceContainerHighest z-20 p-5 w-500px h-500px" teleport="#dev" v-if="obj.state.dev">
      <h3 class="m0 py-2 flex justify-center">开发者模式</h3>
      <var-divider />
      <dev-bin-data :raw="obj.raw"/>
      <var-icon name="window-close" class="absolute top-5 right-5 hover:cursor-pointer z-12" @click="even.close_dev()"/>
    </var-drag>

  <div v-if="obj.mode === 'record'" class="flex justify-between gap-5 items-center fixed top-5 right-5 w-50 px-2 py-3 rounded-xl bg-primaryContainer z-100">
    <span>无人机{{obj.state.record?'录制中':'录制暂停'}}</span>
    <span>{{even.display}}</span>
  </div>
</template>