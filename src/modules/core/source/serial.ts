import { DroneStore } from '../store';
import { SerialConfig, Parser } from '../types';

/**
 * 串口数据源
 *
 * @description
 * 基于 Web Serial API 的数据源实现。
 * 需要浏览器支持 navigator.serial。
 */
export class SerialSource {
    /** 串口实例 */
    //@ts-ignore
    private _port: SerialPort | null = null;
    /** 数据读取器 */
    private _reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    /** 配置 */
    private _config: SerialConfig;
    /** 数据存储 */
    private _store: DroneStore;
    /** 数据解析器 */
    private _parser: Parser;
    /** 是否正在读取 */
    private _is_reading: boolean = false;
    /** 状态监听器 */
    private _status_callbacks: Array<(status: string) => void> = [];
    /** 连接状态 */
    private _status: 'disconnected' | 'connecting' | 'connected' = 'disconnected';

    /**
     * 构造函数
     *
     * @param config - 串口配置
     * @param store - 数据存储实例
     * @param parser - 数据解析器
     */
    constructor(config: SerialConfig, store: DroneStore, parser: Parser) {
        this._config = config;
        this._store = store;
        this._parser = parser;
    }

    /**
     * 检查浏览器是否支持串口
     *
     * @returns 是否支持
     */
    static isSupported(): boolean {
        return 'serial' in navigator;
    }

    /**
     * 连接串口
     *
     * @description 会弹出浏览器串口选择对话框
     */
    async connect(): Promise<void> {
        if (!SerialSource.isSupported()) {
            throw new Error('Web Serial API not supported in this browser');
        }

        this._set_status('connecting');

        try {
            // 请求用户选择串口
            //@ts-ignore
            this._port = await navigator.serial.requestPort();

            // 打开串口
            await this._port.open({
                baudRate: this._config.baud_rate,
                dataBits: this._config.data_bits || 8,
                stopBits: this._config.stop_bits || 1,
                parity: this._config.parity || 'none'
            });

            this._set_status('connected');
            this._start_reading();

        } catch (error) {
            this._set_status('disconnected');
            throw error;
        }
    }

    /**
     * 启动数据读取循环
     */
    private async _start_reading(): Promise<void> {
        if (!this._port?.readable) return;

        this._is_reading = true;

        try {
            this._reader = this._port.readable.getReader();

            while (this._is_reading && this._reader) {
                const { value, done } = await this._reader.read();
                if (done) break;
                if (value) {
                    this._handle_data(value.buffer);
                }
            }
        } catch (error) {
            console.error('Serial read error:', error);
        } finally {
            this._release_reader();
        }
    }

    /**
     * 处理接收到的数据
     */
    private _handle_data(buffer: ArrayBuffer): void {
        try {
            const result = this._parser(buffer);
            if (!result) return;

            const drones = Array.isArray(result) ? result : [result];
            drones.forEach(drone => {
                if (drone?.core?.sn) {
                    this._store.update(drone.core.sn, drone);
                }
            });
        } catch (error) {
            console.error('Parse error:', error);
        }
    }

    /**
     * 释放读取器
     */
    private _release_reader(): void {
        if (this._reader) {
            try {
                this._reader.releaseLock();
            } catch {
                // 忽略释放锁的错误
            }
            this._reader = null;
        }
    }

    /**
     * 断开连接
     */
    async disconnect(): Promise<void> {
        this._is_reading = false;
        this._release_reader();

        if (this._port) {
            await this._port.close();
            this._port = null;
        }

        this._set_status('disconnected');
    }

    /**
     * 发送数据
     *
     * @param data - 要发送的数据
     */
    async send(data: Uint8Array): Promise<void> {
        if (!this._port?.writable) {
            throw new Error('Serial port not connected');
        }

        const writer = this._port.writable.getWriter();
        try {
            await writer.write(data);
        } finally {
            writer.releaseLock();
        }
    }

    /**
     * 获取当前连接状态
     */
    get status(): string {
        return this._status;
    }

    /**
     * 监听状态变化
     *
     * @param callback - 状态变化回调
     * @returns 取消监听的函数
     */
    onStatusChange(callback: (status: string) => void): () => void {
        this._status_callbacks.push(callback);
        return () => {
            const idx = this._status_callbacks.indexOf(callback);
            if (idx > -1) this._status_callbacks.splice(idx, 1);
        };
    }

    /**
     * 设置状态并通知监听器
     */
    private _set_status(status: 'disconnected' | 'connecting' | 'connected'): void {
        this._status = status;
        this._status_callbacks.forEach(cb => cb(status));
    }
}