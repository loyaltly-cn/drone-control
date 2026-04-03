import {DroneBundle, MapInstance} from "@/types";
import {getDroneIcon as originalGetDroneIcon} from "@/modules/utils";

const LIST_FPS = 5           // 列表固定 5fps
const MAP_FPS = 30           // 地图目标 30fps

let mapInstance: MapInstance | null = null
let listCallback: ((list: DroneBundle[]) => void) | null = null

// 状态
let objList: DroneBundle[] = []
let listQueue: DroneBundle[] = []
let mapQueue: DroneBundle[] = []

// 帧控制
let listRafId: number | null = null
let mapRafId: number | null = null
let lastListFrame = 0
let lastMapFrame = 0

// 地图处理状态
let mapPendingQueue: DroneBundle[] = []
let isMapProcessing = false

// 图标缓存
const iconCache = new Map<string, any>()
export const getDroneIcon = (type: string) => {
    if (!iconCache.has(type)) {
        const color = type === 'drone' ? '#3385ff' : '#ff0000'
        iconCache.set(type, originalGetDroneIcon(color))
    }
    return iconCache.get(type)!
}

// 列表循环 (固定5fps)
const loopList = () => {
    const now = performance.now()
    if (now - lastListFrame >= 1000 / LIST_FPS) {
        lastListFrame = now
        if (listQueue.length > 0) {
            objList = listQueue
            listCallback?.(objList)
            listQueue = []
        }
    }
    listRafId = requestAnimationFrame(loopList)
}

// 地图循环：固定30fps，智能分批
const loopMap = () => {
    const now = performance.now()
    const elapsed = now - lastMapFrame

    // 使用 MAP_FPS
    if (elapsed >= 1000 / MAP_FPS && !isMapProcessing) {
        lastMapFrame = now

        // 新数据替换旧数据（丢帧）
        if (mapQueue.length > 0) {
            mapPendingQueue = mapQueue
            mapQueue = []
        }

        if (mapPendingQueue.length > 0) {
            isMapProcessing = true

            // 固定每帧处理数量，避免卡顿
            // 30fps = 每帧33ms，给浏览器留16ms，剩17ms处理
            // 假设每个设备1ms，每帧处理17个
            const MAX_PER_FRAME = 17

            const batch = mapPendingQueue.splice(0, MAX_PER_FRAME)

            // 执行更新
            for (const item of batch) {
                mapInstance?.updateDevice(
                    item.sn,
                    item.map.lng,
                    item.map.lat,
                    item.cell.type,
                    getDroneIcon(item.cell.type)
                )
            }

            isMapProcessing = false
        }
    }

    mapRafId = requestAnimationFrame(loopMap)
}

export const initDroneSync = (
    instance: MapInstance,
    onListUpdate: (list: DroneBundle[]) => void
) => {
    mapInstance = instance
    listCallback = onListUpdate

    loopList()
    loopMap()

    return {
        onData: (list: DroneBundle[]) => {
            listQueue = list
            mapQueue = list
        },

        clear: () => {
            if (listRafId) cancelAnimationFrame(listRafId)
            if (mapRafId) cancelAnimationFrame(mapRafId)

            mapInstance?.clear()
            listQueue = []
            mapQueue = []
            mapPendingQueue = []
            isMapProcessing = false

            listCallback?.([])

            loopList()
            loopMap()
        },

        stop: () => {
            if (listRafId) cancelAnimationFrame(listRafId)
            if (mapRafId) cancelAnimationFrame(mapRafId)
            listRafId = null
            mapRafId = null
        }
    }
}
