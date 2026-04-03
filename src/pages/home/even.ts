import obj from './index'
import theme from '@/modules/theme';
import serial from "@/modules/serial";
import {bus} from "@/modules/hooks";
import {DroneBundle, MapInstance, PosPoint, theme_type} from "@/types";
import render from "./render";
import {Mode} from './types';
import utils from "@/modules/utils";
import {Dialog, Snackbar} from "@varlet/ui";
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import _ from 'lodash'
import {initDroneSync} from "@pages/home/mq.ts";

let instance:MapInstance|null = null;

const change_connect_button = () => obj.state.connect?serial.disconnect():serial.connect()
let current_sn = ''
let timer: ReturnType<typeof setInterval> | null = null
const seconds = ref(0)
let cache_point:PosPoint = {lat:0,lng:0}
let cache_timestamp = 0
const delay = 10
let line_path:Array<PosPoint> = []
dayjs.extend(duration)
let sync:any = null

//@ts-ignore
bus.on('serial:raw',(raw:Uint8Array) => obj.raw = raw)
bus.on('serial:status',(status:boolean)=> {
    obj.state.connect = status
    if (!status) {
        // Snackbar.warning('设备已断开3s后清理页面数据')
        setTimeout(() =>{
            obj.list = []
            instance?.clear()
            sync.clear()
            obj.stats = {offline: 0, online: 0, total: 0}
        },3000)
    }
})
bus.on('drone:stats',(stats:typeof obj.stats) => obj.stats = stats)

const init = (e:MapInstance) =>{
    instance = e
    load_mode('live')
    sync = initDroneSync(
        instance,                    // 地图实例
        (list) => { obj.list = list }   // 列表更新回调
    )
    bus.on('drone:info',data =>{
        if (obj.mode === 'live') sync.onData(data)
    })
}


const load_mode = (mode:Mode) =>{
    obj.mode = mode
    obj.mode = mode
    obj.bar_button = render.bar[mode]
}

const display = computed(() => dayjs.duration(seconds.value, 'seconds').format('HH:mm:ss'))

const toggle = () => {
    console.log(seconds.value)
    obj.state.record = !obj.state.record
    obj.state.record
        ? timer = setInterval(() => seconds.value++, 1000)
        : timer && clearInterval(timer)
}

const reset = () => {
    obj.state.record = false
    if (timer) clearInterval(timer)
    seconds.value = 0
    line_path = []
    instance?.clear()
}

const change_drone_map_show = (index:number) => obj.list[index].cell.show_map = !obj.list[index].cell.show_map

const handleSelect = (v:theme_type) => {
  obj.state.popup.setting = false
  theme.toggleTheme(v)
}

const jump_to_drone_for_map = async (lng,lat) =>{
    instance?.setCenter(lng,lat,25)
}

const open_dev = () =>{
    obj.state.popup.setting = false
    obj.state.dev = true
}

const close_dev = () => obj.state.dev = false

const jump_to_map = (lng:number,lat:number) => instance?.setCenter(lng,lat)

const pos_map = utils.once((point:PosPoint)=> jump_to_map(point.lng,point.lat))

const ready_record = (sn: string) => {
    current_sn = sn
    toggle()
    instance?.clear()
    load_mode('record')
    obj.state.popup.record = false
    obj.list = []
    instance?.clear()
    sync.clear()
    bus.on('drone:record', (drone: DroneBundle) => {
        if (!drone.cell.is_online) Snackbar.warning('设备连接超时')
        if (drone.sn !== current_sn || !obj.state.record) return

        // 同步 Vue 数据给 dashboardz
        obj.record_drone = drone

        // 轨迹逻辑
        const posPoint = { lng: drone.map.lng, lat: drone.map.lat }
        pos_map(posPoint)
        if (!_.isEqual(posPoint, cache_point) && Date.now() > cache_timestamp + delay) {
            line_path.push(posPoint)
            instance?.updateDeviceLine(current_sn,line_path)
            instance?.updateDevice(current_sn,posPoint.lat, posPoint.lng,drone.cell.type,utils.getDroneIcon(drone.cell.type))
            cache_point = _.cloneDeep(posPoint)
            cache_timestamp = Date.now()
        }
    })
}


const pos = () =>{
    const {lng,lat} = obj.record_drone.map
    pos_map({lng,lat})
}

const save_record = () =>{

}

const exit_record = async () =>{
    const actions = {
        confirm: () => {
            console.log('confirm')
        },
        cancel: () => {
            console.log('Cancel')
        },
        close: () => {
            console.log('close')
        },
    }
    if (line_path.length > 5) {
        actions[await Dialog('是否退出并保存录制数据?')]()
    }
}


export default{
    init,
    display,
    toggle,
    reset,
    change_connect_button,
    change_drone_map_show,
    jump_to_drone_for_map,
    handleSelect,
    open_dev,
    close_dev,
    save_record,
    exit_record,
    ready_record,
    pos,
}