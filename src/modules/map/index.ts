import {BMapInitCallBackParam, PosPoint} from "@/types";

let BMapGLInstance:typeof BMapGL | null = null
let mapInstance:BMapGL.Map | null
// 保存地图实例并自动定位
export const init_map = (e:BMapInitCallBackParam) => {
    mapInstance = e.map
    BMapGLInstance = e.BMapGL

    if (!BMapGLInstance) {
        console.error('BMapGL 未获取到，尝试从 window 获取')
        BMapGLInstance = window.BMapGL
        console.log('从 window 获取:', BMapGLInstance)
    }

    // 初始化后立即定位
    locateMe()
}

// 定位方法
const locateMe = () => {
    console.log('=== locateMe 被调用 ===')

    if (!mapInstance) {
        console.warn('mapInstance 未初始化')
        return
    }

    if (!BMapGLInstance) {
        console.warn('BMapGLInstance 未初始化，尝试从 window 获取')
        BMapGLInstance = window.BMapGL
        if (!BMapGLInstance) {
            console.error('无法获取 BMapGL，退出')
            return
        }
    }

    console.log('开始创建 Geolocation 实例...')
    const geolocation = new BMapGLInstance.Geolocation()
    console.log('Geolocation 实例:', geolocation)

    geolocation.getCurrentPosition((r) => {
        console.log('定位回调:', r, '状态:', geolocation.getStatus())

        if (geolocation.getStatus() === 0) {
            mapInstance!.clearOverlays()
            const mk = new BMapGLInstance!.Marker(r.point)
            mapInstance!.addOverlay(mk)
            mapInstance!.panTo(r.point)
            mapInstance!.setZoom(16)
            console.log('定位成功完成')
        } else {
            console.error('定位失败，状态码:', geolocation.getStatus())
        }
    }, {
        enableHighAccuracy: true,
        timeout: 5000
    })
}

// 跳转到指定经纬度
export const jump_to_map = (_point:PosPoint, zoom = 30,instance?:BMapGL.Map) => {
    if (!mapInstance || !BMapGLInstance) {
        console.warn('地图未初始化')
        return
    }
    const {lng, lat} = _point
    const point = new BMapGLInstance.Point(lng, lat)

    // 移动地图
    instance?instance.centerAndZoom(point,zoom):mapInstance.centerAndZoom(point, zoom)
}