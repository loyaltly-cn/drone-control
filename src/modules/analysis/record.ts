import {DroneBundle} from "@/types";

const view_cover_object = (drone:DroneBundle)=> {
    const list = drone.dashboard.list
    const arr = [
        Number(list[2].val),
        Number(list[3].val),
        Number(list[4].val),
        Number(list[5].val),
        Number(list[0].val),
        Number(list[1].val),
        Number(list[6].val),
        Number(list[7].val),
        Number(list[8].val),
        Number(list[9].val)
    ]
    return encode(arr)
}


// 编码（小端序）
function encode(data: number[]): ArrayBuffer {
    const buffer = new ArrayBuffer(48)
    const view = new DataView(buffer)
    let offset = 0

    // 4个经纬度：float64（8字节）
    for (let i = 0; i < 4; i++) {
        view.setFloat64(offset, data[i], true) // true = little-endian
        offset += 8
    }

    // 3个uint8：27, 20, 0
    view.setUint8(offset++, data[4])
    view.setUint8(offset++, data[5])
    view.setUint8(offset++, data[6])

    // 2个小浮点：float32（4字节）
    view.setFloat32(offset, data[7], true)
    offset += 4
    view.setFloat32(offset, data[8], true)
    offset += 4

    // 最后1个uint8：105
    view.setUint8(offset, data[9])

    return buffer
}

// 解码
function record_decode(buffer: ArrayBuffer): number[] {
    const view = new DataView(buffer)
    const result: number[] = []
    let offset = 0

    for (let i = 0; i < 4; i++) {
        result.push(view.getFloat64(offset, true))
        offset += 8
    }

    result.push(view.getUint8(offset++))
    result.push(view.getUint8(offset++))
    result.push(view.getUint8(offset++))

    result.push(view.getFloat32(offset, true))
    offset += 4
    result.push(view.getFloat32(offset, true))
    offset += 4

    result.push(view.getUint8(offset))

    return result
}


export {
    view_cover_object,
    record_decode
}