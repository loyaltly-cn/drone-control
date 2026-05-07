import {DroneBusinessData, DroneCoreData, DroneData} from "../core/types";
import {Device, deviceService} from "@/modules/db";

let devices: Array<Device>;

(async () => {
    devices = await deviceService.getAll();
    console.log(devices);
    // 后续依赖 devices 的代码放这里，或确保在赋值后再执行
})();
console.log(devices)
const FRAME = {
    HEADER: new Uint8Array([0xDD, 0x53, 0xFA, 0x0B, 0xBC]),
    HEADER_LEN: 5,
    LENGTH: 85
};

// 缓冲区
let buffer = new Uint8Array(0);

//报文起始字节头下标
const MSG_HEADER = {
    BASE:10,//基本ID报文
    POS:35,//位置向量报文
    SYSTEM:60//系统报文
}

type MSG_Type = 'BASE'|'POS'|'SYSTEM'

const bytesToInt32 = (data: number[]) =>{
    // 小端序解析 uint32
    const raw = (data[0] | (data[1] << 8) | (data[2] << 16) | (data[3] << 24)) >>> 0;

    // 转为 int32（补码）
    const signed = raw > 0x7FFFFFFF ? raw - 0x100000000 : raw

    // 转 float 并乘 1e-7（C 代码里没乘，但经纬度通常要转度）
    return parseFloat(String((signed * 1e-7)))
}


export function parse_drone_data(data: ArrayBuffer): DroneData[] {
    // 1. 拼接
    const newData = new Uint8Array(data);
    const combined = new Uint8Array(buffer.length + newData.length);
    combined.set(buffer);
    combined.set(newData, buffer.length);

    const drones: DroneData[] = [];
    let offset = 0;

    // 2. 找完整帧
    while (offset + FRAME.LENGTH <= combined.length) {
        // 检查帧头
        let match = true;
        for (let i = 0; i < FRAME.HEADER_LEN; i++) {
            if (combined[offset + i] !== FRAME.HEADER[i]) {
                match = false;
                break;
            }
        }

        if (!match) {
            offset++;  // 没找到，跳过 1 字节继续找
            continue;
        }

        // 提取 85 字节
        const frame = combined.slice(offset, offset + FRAME.LENGTH);
        const drone = parse_frame(frame.buffer);
        if (drone) {
            drones.push(drone);
        }

        offset += FRAME.LENGTH;
    }

    // 3. 保存剩余不足 85 字节的数据
    buffer = combined.slice(offset);

    return drones;
}

function toHex(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(' ');
}

function parse_frame(_frame: ArrayBuffer): DroneData | null {
    const frame = new Uint8Array(_frame)
    toHex(frame)
    //处理基本ID报文
    const get = (type: MSG_Type, index: number, num: number) => [...frame.slice(MSG_HEADER[type] + index,MSG_HEADER[type]+index+num)]
    const core:DroneCoreData = {}
    const business:DroneBusinessData = {}
    if(frame[MSG_HEADER.BASE] === 0x01){ //0x01
        core.sn = new TextDecoder().decode(new Uint8Array(get('BASE', 2, 20)))
        core.name = <string>devices.find((item => item.sn === core.sn.slice(0, 8)))?.type
    }
    if(frame[MSG_HEADER.POS] === 0x11){
        core.heading = get('POS', 2, 1)[0]
        core.lat = bytesToInt32(get('POS', 5, 4))
        core.lng = bytesToInt32(get('POS', 9, 4))
        core.speed = get('POS', 3, 1)[0]
        core.altitude_speed = get('POS', 4, 1)[0]
        core.pressure_altitude = bytesToInt32(get('POS', 13, 2))
        core.geometric_height = bytesToInt32(get('POS', 15, 2))
        core.altitude = bytesToInt32(get('POS', 17, 2))
    }

    if(frame[MSG_HEADER.SYSTEM] === 65){
        core.con_lat = bytesToInt32(get('SYSTEM', 2, 4))
        core.con_lng = bytesToInt32(get('SYSTEM', 6, 4))
        core.radius = get('SYSTEM', 12, 1)[0]
        core.max = bytesToInt32(get('SYSTEM', 13, 2))
        core.min = bytesToInt32(get('SYSTEM', 15, 2))
    }

    return {
        core,
        business
    };
}