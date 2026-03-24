import global from "../global";
import {bus} from "../hooks";
import {droneStore} from "./drone.ts";
import {Snackbar} from "@varlet/ui";
import {MSG_Type} from "../../types";

//定时器
const timers = new Map<string,NodeJS.Timeout>()

const FRAME = {
    HEADER: new Uint8Array([0xDD, 0x53,0xFA,0x0B,0xBC]),
    LENGTH: 85,
    HEADER_LEN: 5
};

//报文起始字节头下标
const MSG_HEADER = {
    BASE:10,//基本ID报文
    POS:35,//位置向量报文
    SYSTEM:60//系统报文
}

// 解析帧
const parseFrames = (rxBuffer:Uint8Array) => {
    while (rxBuffer.length >= FRAME.HEADER_LEN) {

        // 查找帧头
        const headerIndex = findHeader(rxBuffer);

        if (headerIndex === -1) {
            // 没找到帧头，丢弃数据（或保留最后1字节防止跨帧分割）
            rxBuffer = rxBuffer.slice(-1);
            break;
        }

        // 丢弃帧头前的垃圾数据
        if (headerIndex > 0) rxBuffer = rxBuffer.slice(headerIndex);

        // 检查是否有完整帧
        if (rxBuffer.length < FRAME.LENGTH) break

        // 提取完整帧
        const frame = rxBuffer.slice(0, FRAME.LENGTH);
        rxBuffer = rxBuffer.slice(FRAME.LENGTH);  // 移除已处理的数据

        // 处理帧
        processFrame(frame);
    }
};

// 查找帧头
const findHeader = (data: Uint8Array): number => {
    for (let i = 0; i <= data.length - FRAME.HEADER_LEN; i++) {
        if (data[i] === FRAME.HEADER[0] && data[i + 1] === FRAME.HEADER[1]) {
            return i;
        }
    }
    return -1;
};

// 处理完整帧
const processFrame = (frame: Uint8Array) => {
    bus.emit('serial:raw',{
        raw:frame
    })
    //@ts-expect-error
    let info:MSG_INFO = {}
    //处理基本ID报文
    const get = (type: MSG_Type, index: number, num: number) => [...frame.slice(MSG_HEADER[type] + index,MSG_HEADER[type]+index+num)]

    if(frame[MSG_HEADER.BASE] === 1){ //0x01
        info.base = {
            sn: new TextDecoder().decode(new Uint8Array(get('BASE', 2, 20))),
            tid: (get('BASE', 11, 1)[0] >> 4) & 0x0f,
            tua: get('BASE', 11, 1)[0] & 0x0f
        }
    }

    //处理位置向量报文
    if(frame[MSG_HEADER.POS] === 17){ //0x11
        info.pos = {
            Track_angle: get('POS', 2, 1)[0],
            lat: bytesToInt32(get('POS', 5, 4)),
            lng: bytesToInt32(get('POS', 9, 4)),
            fly_speed: get('POS', 3, 1)[0],
            vertical_speed: get('POS', 4, 1)[0],
            pressure_altitude: bytesToInt32(get('POS', 13, 2)),
            geometric_height: bytesToInt32(get('POS', 15, 2)),
            altitude: (((frame[53] << 8) | frame[52])-2000)/2 ,
            horizontal_accuracy: (get('POS', 19, 1)[0] >> 4) & 0x0f,
            vertical_accuracy: get('POS', 19, 1)[0] && 0x0f,
            speed_accuracy: get('POS', 20, 1)[0],
            timeStamp: get('POS', 21, 2),
            timeStamp_accuracy: get('POS', 23, 1)[0]
        }
    }

    //处理系统报文
    if(frame[MSG_HEADER.SYSTEM] === 65){  //0x41
        const ua = get('SYSTEM',17,1)[0]
        info.system = {
            lng: bytesToInt32(get('SYSTEM', 6, 4)),
            lat: bytesToInt32(get('SYSTEM', 2, 4)),
            rac: get('SYSTEM', 10, 2),
            oar: get('SYSTEM', 12, 1)[0],
            max: bytesToInt32(get('SYSTEM', 13, 2)),
            min: bytesToInt32(get('SYSTEM', 15, 2)),
            type: (ua >> 4) & 0x0F,
            level: ua & 0x0F,
            height: bytesToInt32(get('SYSTEM', 18, 2)),
            timestamp: get('SYSTEM', 20, 4),

        }
    }

    const sn = info.base.sn
    // if (sn === '1581F5YHE5F666G77788') console.log(info.pos.lng,info.pos.lat)
    const device = global.devices.find(d => d.sn === sn.slice(0, 8));

    droneStore.updateFromFrame(info, device && {
        type: device.type,
        color: device.color
    });

    run_timer(sn)
    bus.emit('drone:record',droneStore.get(sn))
    bus.emit('drone:info',droneStore.list)
    bus.emit('drone:stats',droneStore.stats)
};

const bytesToInt32 = (data: number[]) =>{
    // 小端序解析 uint32
    const raw = (data[0] | (data[1] << 8) | (data[2] << 16) | (data[3] << 24)) >>> 0;

    // 转为 int32（补码）
    const signed = raw > 0x7FFFFFFF ? raw - 0x100000000 : raw;

    // 转 float 并乘 1e-7（C 代码里没乘，但经纬度通常要转度）
    return parseFloat((signed * 1e-7).toFixed(6));
}


//无人机断开连接定时器
const run_timer = (sn:string) =>{
    //超过定时的无人机处理函数
    const func_cancel = (sn:string) =>{
        droneStore.markOffline(sn)
        const type = global.devices.find(d => d.sn === sn.slice(0, 8));
        Snackbar.warning(`设备${type}已离线`)
        timers.delete(sn)
    }


    // 清除旧定时器（如果存在）
    clearTimeout(timers.get(sn));
    // 重置定时器
    timers.set(sn, setTimeout(() => func_cancel(sn), 10000));
}



export default {
    parseFrames
}