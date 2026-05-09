import {MapInstance} from "@/types";
import {state} from './index'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import {Emits} from "@/components/bottom-bar/render";
import {DroneData, DroneMonitor} from "@/modules/core";
import {parse_drone_data} from "@/modules/parser";
//@ts-ignore
let instance:MapInstance|null = null;
let sns:Set<string> = new Set<string>()
dayjs.extend(duration)

// const BPS = 115200

const init = (e:MapInstance) =>{
    instance = e
}

const monitor = new DroneMonitor({
    source:'websocket',
    websocket:{
      url:'ws://218.93.177.50:8082/ws'
    },
    parser:parse_drone_data,
    enable_track:true
})

monitor.onDiff(diff =>{
    const func = (arr: Map<string, DroneData>)=> arr.forEach(drone =>{
        const {core} = drone
        // console.log(core.pressure_altitude,core.geometric_height,core.altitude)
        instance?.updateDevice(core);
        if (sns.has(core.sn)){
            const {sn,lat,lng} = core
            instance?.updateDeviceLine(sn,{
                lat,
                lng
            })
        }
    });

    const {added,updated} = diff;
    func(added)
    func(updated)
})


monitor.onStatusChange(status =>{
    switch (status) {
        case 'connected':
            state.connect = true
            break
        case 'idle':
            state.connect = false
            break
        default:break
    }
})


const change = (emit:Emits) => {
    console.log(emit)
    switch (emit){
        case "connect":
            state.connect?monitor.disconnect():monitor.connect()
            break
        default:break
    }
}

const on_line = (sn:string) =>{
    sns.add(sn)
}

export default{
    init,
    change,
    on_line
}