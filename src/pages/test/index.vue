<script setup lang="ts">
// 保存地图实例，供其他方法调用
let mapInstance: any = null

const onMapReady = (instance: any) => {
  mapInstance = instance

  console.log(instance)
  // 立即测试
  // instance.addMarker(119.969253, 31.679333, '起点')
  // instance.drawLine([
  //   { lng: 119.969253, lat: 31.679333 },
  //   { lng: 119.969300, lat: 31.679400 }
  // ])
}

// 其他方法中调用
const updateDronePosition = (lng: number, lat: number) => {
  mapInstance?.addMarker(lng, lat)
  mapInstance?.setCenter(lng, lat)
}
</script>

<template>
  <Map @ready="onMapReady" />
</template>