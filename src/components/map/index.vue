<!-- Map.vue -->
<template>
  <div class="relative w-screen h-screen">
    <div ref="mapEl" class="absolute inset-0 z-0"/>
    <div class="absolute mobile:bottom-13 bottom-2 left-2 z-50 flex flex-col gap-2">
      <button v-for="(item,index) in buttons" :key="index" @click="item.func" class="w-10 h-10 mobile:w-8 mobile:h-8 bg-body rounded-lg shadow-lg flex items-center justify-center hover:cursor-pointer">
        <var-icon :name="item.name" class="color-text"/>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import {MapInstance} from "./types";
import 'leaflet-rotatedmarker'
import {createPopupEl} from "@/components/popup";

const buttons = [{
  name:'plus',
  func:() => zoomIn()
},{
  name:'minus',
  func:() => zoomOut()
},{
  name:'map-marker-radius-outline',
  func:() =>locateMe()
}]

const emit = defineEmits<{
  ready: [instance: MapInstance]
}>()


const mapEl = ref<HTMLDivElement>()
const TIANDITU_KEY = '8adcc486cb1f173f92102c2ec33763ae'

let map: L.Map | null = null
let currentMarker: L.Marker | null = null
const markers = new Map<string, L.Marker>()
const lines = new Map<string, L.Polyline>()
const iconCache = new Map<string, L.Icon>()
const getAircraftIcon = (size = 60): L.Icon => {
  const key = `drone-${size}`
  if (!iconCache.has(key)) {
    const icon = L.icon({
      iconUrl: '/drone.png',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2], // 锚点在图标中心
      popupAnchor: [0, -size / 2]
    })
    iconCache.set(key, icon)
  }
  return iconCache.get(key)!
}
onMounted(() => {
  if (!mapEl.value) return

  map = L.map(mapEl.value,{
    zoomControl:false,
    attributionControl:false
  }).setView([31.678395832970725, 119.97093534871875], 16)
  L.control.attribution({
    prefix: '小域智能'
  }).addTo(map)

  // 矢量底图（道路、行政区划）
  L.tileLayer(
      `https://t{s}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TIANDITU_KEY}`,
      { subdomains: ['0','1','2','3','4','5','6','7'] }
  ).addTo(map)

  // 标注层（地名、路名）
  L.tileLayer(
      `https://t{s}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TIANDITU_KEY}`,
      { subdomains: ['0','1','2','3','4','5','6','7'], zIndex: 100 }
  ).addTo(map)

  const instance: MapInstance = {
    updateDevice: (args) => {
      if (!map) return

      const existing = markers.get(args.sn)
      const {lat,lng} = args
      // 已存在
      if (existing) {
        existing.setLatLng([lat, lng])
        ;(existing as any).setRotationAngle(args.heading)

        // popup打开时更新内容
        if (args && existing.isPopupOpen()) {
          const el = createPopupEl({
            ...args
          })

          existing.setPopupContent(el)
        }

        return
      }

      // 创建 marker
      const marker = L.marker([lat, lng], {
        icon: getAircraftIcon(40),
      }).addTo(map)

      // ⭐⭐⭐ 关键：绑定 popup
      if (args) {
        const el = createPopupEl({
         ...args
        })

        marker.bindPopup(el)
      }

      markers.set(args.sn, marker)
    },

    updateDeviceLine: (id, points) => {
      if (!map || points.length < 2) return
      const existing = lines.get(id)
      const latlngs = points.map(p => [p.lat, p.lng])
      if (existing) {
        existing.setLatLngs(latlngs)
      } else {
        const line = L.polyline(latlngs, { color: 'red', weight: 3 }).addTo(map)
        lines.set(id, line)
      }
    },

    removeDevice: (id) => {
      markers.get(id)?.remove()
      lines.get(id)?.remove()
      markers.delete(id)
      lines.delete(id)
    },

    clear: () => {
      // 先复制再遍历，避免遍历中修改
      const markersToRemove = Array.from(markers.values())
      const linesToRemove = Array.from(lines.values())

      markersToRemove.forEach(m => m.remove())
      linesToRemove.forEach(l => l.remove())

      markers.clear()
      lines.clear()
      console.log(markers)
      console.log('清理后 markers:', markers.size, 'lines:', lines.size)
    },

    setCenter: (lng, lat, zoom = 15) => {
      map?.setView([lat, lng], zoom)
    }
  }

  emit('ready', instance)
})

const browserLocate = () => {
  Snackbar.loading('正在定位。。。')
  if (!navigator.geolocation) return

  navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        map?.setView([latitude, longitude], 15)
        console.log(latitude,longitude)
        currentMarker?.remove()
        currentMarker = L.circleMarker([latitude, longitude], {
          radius: 8,
          fillColor: '#3385ff',
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(map!).bindPopup('当前位置')
        Snackbar.clear()
      },
      (err) => console.error('定位失败:', err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0
      }
  )
}

const locateMe = () => browserLocate()
const zoomIn = () => map?.zoomIn()
const zoomOut = () => map?.zoomOut()
</script>
