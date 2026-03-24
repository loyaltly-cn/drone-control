import obj from './index'
import theme from '../../modules/theme';
import {theme_type} from '../../modules/theme/type';
import serial from "../../modules/serial";
import {bus} from "../../modules/hooks";
import {init_map, jump_to_map} from "../../modules/map";
import {BMapInitCallBackParam, DroneBundle, PosPoint} from "../../types";
import render from "./render";
import {Mode} from './types';
import utils from "../../modules/utils";
import {Snackbar} from "@varlet/ui";
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import _ from 'lodash'
import record from "../../modules/analysis/record.ts";
let instance:BMapGL.Map | null
let currentMarker: any = null

const change_connect_button = () => obj.state.connect?serial.disconnect():serial.connect()
let current_sn = ''
let timer: ReturnType<typeof setInterval> | null = null
const seconds = ref(0)
let cache_point:PosPoint = {lat:0,lng:0}
let record_bin:Array<Uint8Array> = []
let currentPolyline: any = null
dayjs.extend(duration)

const init = (e:BMapInitCallBackParam) =>{
    console.log('init')
    instance = e.map
    init_map(e)
    load_mode('default')
    // @ts-ignore
    bus.on('serial:raw',(raw:Uint8Array) => obj.raw = raw)
    bus.on('serial:status',(status:boolean)=> obj.state.connect = status)
    bus.on('drone:info',(list:Array<DroneBundle>) => obj.list = list)
    bus.on('drone:stats',(stats:typeof obj.stats) => obj.stats = stats)
}

const updatePolyline = () => {
    // 删除旧轨迹
    if (currentPolyline) {
        instance?.removeOverlay(currentPolyline)
    }

    // 创建新轨迹
    if (obj.line_path.length > 1) {
        const points = obj.line_path.map(p => new BMapGL.Point(p.lng, p.lat))
        currentPolyline = new BMapGL.Polyline(points, {
            strokeColor: obj.record_drone.map?.color || '#3385ff',
            strokeWeight: 3,
            strokeOpacity: 0.8
        })
        instance?.addOverlay(currentPolyline)
    }
}


const load_mode = (mode:Mode) =>{
    obj.mode = mode
    if (mode === 'default') obj.bar_button = render.bar.default
    if (mode === 'record') obj.bar_button = render.bar.record
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
    // obj.map_line = []
    record_bin = []
}

const change_drone_map_show = (index:number) =>{
    obj.list[index].cell.show_map = !obj.list[index].cell.show_map;
    jump_to_drone_for_map(index)
}

const change_drone_dashboard_show = (index:number) => obj.list[index].cell.show_dashboard = !obj.list[index].cell.show_dashboard;


const handleSelect = (v:theme_type) => {
  obj.state.popup.setting = false
  theme.toggleTheme(v)
}

const jump_to_drone_for_map = (index:number) =>{
    const {lng,lat} = obj.list[index].map
    jump_to_map({lng,lat})
}


const open_dev = () =>{
    obj.state.popup.setting = false
    obj.state.dev = true
}

const close_dev = () => obj.state.dev = false

const pos_map = utils.once((point:PosPoint)=> jump_to_map(point))

const ready_record = (sn: string) => {
    current_sn = sn
    toggle()
    load_mode('record')
    obj.state.popup.record = false

    bus.on('drone:record', (drone: DroneBundle) => {
        if (!drone.cell.is_online) Snackbar.warning('设备连接超时')
        if (drone.sn !== current_sn || !obj.state.record) return

        // 删除旧标记
        if (currentMarker) {
            instance?.removeOverlay(currentMarker)
        }

        // 创建新标记
        const point = new BMapGL.Point(drone.map.lng, drone.map.lat)
        const icon = new BMapGL.Icon(
            utils.getDroneIcon(drone.map.color).imageUrl,
            new BMapGL.Size(25, 25)
        )
        currentMarker = new BMapGL.Marker(point, { icon })
        instance?.addOverlay(currentMarker)

        // 同步 Vue 数据给 dashboard
        obj.record_drone = drone

        // 轨迹逻辑
        const posPoint = { lng: drone.map.lng, lat: drone.map.lat }
        pos_map(posPoint)

        if (!_.isEqual(posPoint, cache_point)) {
            // cache_timestamp = Date.now()
            obj.line_path.push(posPoint)
            updatePolyline()
            record_bin.push(<Uint8Array>record.view_cover_object(drone))
            cache_point = _.cloneDeep(posPoint)
        }
    })
}


const pos = () =>{
    const {lng,lat} = obj.record_drone.map
    pos_map({lng,lat})
}

const save_record = () =>{

}

const exit_record = () =>{

}

export default{
    init,
    display,
    toggle,
    reset,
    change_connect_button,
    change_drone_map_show,
    change_drone_dashboard_show,
    jump_to_drone_for_map,
    handleSelect,
    open_dev,
    close_dev,
    save_record,
    exit_record,
    ready_record,
    pos,
}