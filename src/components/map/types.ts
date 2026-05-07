import {PosPoint} from "@/types/drone";
import {DroneCoreData} from "@/modules/core";

export interface DroneMapData {
    id: string
    lng: number
    lat: number
    type: 'drone' | 'station'
    heading?: number  // 机头朝向（可选）
}

export interface MapInstance {
    updateDevice: (args: DroneCoreData) => void
    updateDeviceLine: (id: string, points: PosPoint[]) => void
    removeDevice: (id: string) => void
    clear: () => void
    setCenter: (lng: number, lat: number, zoom?: number) => void
}


export interface MapIcon{
    imageUrl:string
    size: { width: number, height: number }
}