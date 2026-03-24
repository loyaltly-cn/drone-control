import {Snackbar} from "@varlet/ui";
import analysis from "../analysis";
import {Serial} from "../../types";
import {bus} from "../hooks";

let rxBuffer = new Uint8Array(0);
const BPS = 115200
const serial:Serial = {
    port:null,
    reader:null
}

const connect = async () => {
    try {
        serial.port  = await navigator.serial.requestPort();

        await serial.port!.open({ baudRate: BPS });
        await read_loop();

    } catch (e:any) {
        Snackbar.error(e)
    } finally {
        bus.emit('serial:status',false)
    }
};


//数据读取
const read_loop = async () => {

    // 连接两个 Uint8Array
    const concatUint8Array = (a: Uint8Array, b: Uint8Array): Uint8Array => {
        const result = new Uint8Array(a.length + b.length);
        result.set(a, 0);
        result.set(b, a.length);
        return result;
    };


    if (!serial.port?.readable) return;

    serial.reader = serial.port!.readable!.getReader();

    try {

        // 单一循环持续读取，直到 done 或出错
        bus.emit('serial:status',true)
        while (true) {
            const { value, done } = await serial.reader!.read();
            if (done) break;  // 设备断开时才会 true
            if (!value) continue;
            rxBuffer = concatUint8Array(rxBuffer, value);
            // console.log('收到:', value.length, '字节, 缓冲:', rxBuffer.length, '字节');
            // 解析帧
            analysis.parseFrames(rxBuffer);
        }

        // console.log('正常结束读取');

    } catch (error) {
        console.error('读取错误:', error);
    } finally {
        await disconnect()
        console.log('finally - 释放锁');
        serial.reader!.releaseLock();
        serial.reader = null;
        bus.emit('serial:status',false)
    }



};
//串口断开
const disconnect = async () => {
    if (!serial.port) return;

    try {

        if (serial.reader) {
            await serial.reader!.cancel();
        }

        await serial.port!.close();
        serial.port = null;

    } catch (error) {
        console.error('断开连接错误:', error);
    }
};

export default {
    connect,
    disconnect,
}