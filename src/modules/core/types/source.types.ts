import { DroneData } from './drone.types';

/**
 * 数据解析器函数类型
 *
 * @param data - 原始二进制数据
 * @returns 解析后的无人机数据，可以是单个、数组或 null（解析失败）
 */
export type Parser = (data: ArrayBuffer) => DroneData | DroneData[] | null;

/**
 * WebSocket 数据源配置
 */
export interface WebSocketConfig {
    /** WebSocket 服务端地址 */
    url: string;
    /** 子协议 */
    protocols?: string | string[];
    /** 重连配置 */
    reconnect?: {
        /** 是否启用重连 */
        enabled: boolean;
        /** 最大重连次数，默认 10 */
        max_attempts?: number;
        /** 初始重连延迟（毫秒），默认 3000 */
        initial_delay?: number;
    };
}

/**
 * 串口数据源配置
 */
export interface SerialConfig {
    /** 波特率 */
    baud_rate: number;
    /** 数据位，默认 8 */
    data_bits?: 7 | 8;
    /** 停止位，默认 1 */
    stop_bits?: 1 | 2;
    /** 校验位，默认 none */
    parity?: 'none' | 'even' | 'odd';
}

/**
 * SDK 初始化配置
 */
export interface CoreConfig {
    /** 数据源类型 */
    source: CoreSource;
    /** WebSocket 配置（source 为 websocket 时必填） */
    websocket?: WebSocketConfig;
    /** 串口配置（source 为 serial 时必填） */
    serial?: SerialConfig;
    /** 数据解析器 */
    parser: Parser;
    frame?: FrameConfig;
    /** 是否启用轨迹记录，默认 false */
    enable_track?: boolean;
    /** 轨迹最大点数，默认 5000 */
    track_max_points?: number;
    /** 离线超时时间（毫秒），默认 10000 */
    offline_timeout?: number;
}

export type CoreSource = 'websocket' | 'serial'

export interface FrameConfig {
    header: Uint8Array;      // 帧头
    length: number;          // 帧总长度
    header_offset?: number;  // 帧头在帧内的偏移，默认 0
}
