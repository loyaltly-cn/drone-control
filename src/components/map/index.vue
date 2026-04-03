<!-- Map.vue -->
<template>
  <div class="relative w-screen h-screen">
    <div ref="mapEl" class="absolute inset-0 z-0"/>

    <div class="absolute bottom-5 right-4 z-50 flex flex-col gap-2">
      <button @click="zoomIn" class="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-100 hover:cursor-pointer">
        <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <button @click="zoomOut" class="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-100 hover:cursor-pointer">
        <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
      </button>

      <button @click="locateMe" class="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-100 hover:cursor-pointer">
        <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import {MapInstance} from "@/types";

const emit = defineEmits<{
  ready: [instance: MapInstance]
}>()


const mapEl = ref<HTMLDivElement>()
const TIANDITU_KEY = '8adcc486cb1f173f92102c2ec33763ae'

let map: L.Map | null = null
let currentMarker: L.Marker | null = null
const markers = new Map<string, L.Marker>()
const lines = new Map<string, L.Polyline>()

onMounted(() => {
  if (!mapEl.value) return

  map = L.map(mapEl.value,{
    zoomControl:false,
    attributionControl:false
  }).setView([39.9042, 116.4074], 16)
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

  browserLocate()
  const iconCache = new Map<string, L.Icon>()
  const getIcon = (iconData: any) => {
    const key = `${iconData.imageUrl}-${iconData.size.width}-${iconData.size.height}`

    if (!iconCache.has(key)) {
      const icon = L.icon({
        iconUrl: iconData.imageUrl,
        iconSize: [iconData.size.width, iconData.size.height],
        iconAnchor: [iconData.size.width / 2, iconData.size.height / 2],
        popupAnchor: [0, -iconData.size.height / 2]
      })
      iconCache.set(key, icon)
    }

    return iconCache.get(key)!
  }

  const instance: MapInstance = {
    updateDevice: (id, lng, lat, popup, icon) => {
      if (!map) return

      const existing = markers.get(id)
      if (existing) {
        existing.setLatLng([lat, lng])
        return
      }

      // 缓存 icon，避免重复创建
      const markerIcon = icon ? getIcon(icon) : undefined

      const marker = L.marker([lat, lng], markerIcon ? { icon: markerIcon } : undefined).addTo(map)
      if (popup) marker.bindPopup(popup)
      markers.set(id, marker)
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
