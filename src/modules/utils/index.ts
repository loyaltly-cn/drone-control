//@ts-ignore
import {jumpToLocation} from "../../modules//babidu_map";

// // 辅助函数：转十六进制
const toHex = (arr: Uint8Array): string => [...arr].map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');

const getDroneIcon = (color: string = '#000000') => {
    const hexColor = color.startsWith('#') ? color : `#${color}`

    // DJI 风格四旋翼无人机
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><rect x="2" y="2" width="8" height="3" rx="1" fill="${hexColor}"/><rect x="14" y="2" width="8" height="3" rx="1" fill="${hexColor}"/><rect x="2" y="19" width="8" height="3" rx="1" fill="${hexColor}"/><rect x="14" y="19" width="8" height="3" rx="1" fill="${hexColor}"/><rect x="8" y="8" width="8" height="8" rx="2" fill="${hexColor}"/><circle cx="12" cy="12" r="2.5" fill="#fff"/><circle cx="12" cy="12" r="1.5" fill="${hexColor}"/></svg>`

    const base64 = typeof window !== 'undefined'
        ? btoa(unescape(encodeURIComponent(svg)))
        : Buffer.from(svg).toString('base64')

    return {
        imageUrl: `data:image/svg+xml;base64,${base64}`,
        size: { width: 32, height: 32 }
    }
}


function encode(num:number) {
    const int = Math.round(num * 1e6);  // 转整数，保留6位
    const buf = new ArrayBuffer(4);
    const view = new DataView(buf);
    view.setInt32(0, int, false);        // false = 大端序
    return new Uint8Array(buf);
}

/**
 * 解码
 */
function decode(bytes: Uint8Array) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, 4);
    const int = view.getInt32(0, false); // false = 大端序
    return int / 1e6;
}

const once = <T extends (...args: any[]) => any>(fn: T) => {
    let called = false;
    return (...args: Parameters<T>): ReturnType<T> | void => {
        if (called) return;
        called = true;
        return fn(...args);
    };
};

export default {
    toHex,
    getDroneIcon,
    encode,
    decode,
    once
}