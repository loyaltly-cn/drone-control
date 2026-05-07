import { DroneStore, TrackStore } from '../store';
import { WebSocketConfig, Parser } from '../types';

/**
 * WebSocket 数据源
 *
 * @description
 * 基于浏览器原生 WebSocket 的数据源实现。
 * 支持自动重连、二进制数据接收。
 */
export class WebSocketSource {
    /** WebSocket 实例 */
    private _ws: WebSocket | null = null;
    /** 配置 */
    private _config: WebSocketConfig;
    /** 数据存储 */
    private _store: DroneStore;
    /** 轨迹存储 */
    private _track_store: TrackStore | null;
    /** 数据解析器 */
    private _parser: Parser;
    /** 当前重连次数 */
    private _reconnect_attempts: number = 0;
    /** 重连定时器 */
    private _reconnect_timer: ReturnType<typeof setTimeout> | null = null;
    /** 连接状态 */
    private _status: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
    /** 状态监听器 */
    private _status_callbacks: Array<(status: string) => void> = [];

    /**
     * 构造函数
     *
     * @param config - WebSocket 配置
     * @param store - 数据存储实例
     * @param parser - 数据解析器
     * @param track_store - 轨迹存储实例（可选）
     */
    constructor(
        config: WebSocketConfig,
        store: DroneStore,
        parser: Parser,
        track_store?: TrackStore
    ) {
        this._config = config;
        this._store = store;
        this._parser = parser;
        this._track_store = track_store || null;
    }

    /**
     * 建立 WebSocket 连接
     *
     * @returns Promise，连接成功时 resolve，失败时 reject
     */
    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this._ws) this.disconnect();

            this._set_status('connecting');

            try {
                this._ws = new WebSocket(this._config.url, this._config.protocols);
                this._ws.binaryType = 'arraybuffer';

                this._ws.onopen = () => {
                    this._set_status('connected');
                    this._reconnect_attempts = 0;
                    resolve();
                };

                this._ws.onmessage = (event: MessageEvent) => {
                    if (event.data instanceof ArrayBuffer) {
                        this._handle_data(event.data);
                    }
                };

                this._ws.onclose = (event: CloseEvent) => {
                    this._set_status('disconnected');
                    this._ws = null;

                    // 非正常关闭时尝试重连
                    if (event.code !== 1000 && this._config.reconnect?.enabled) {
                        this._schedule_reconnect();
                    }
                };

                this._ws.onerror = (error) => {
                    if (this._status === 'connecting') reject(error);
                    console.error('WebSocket error:', error);
                };

            } catch (error) {
                this._set_status('disconnected');
                reject(error);
            }
        });
    }

    /**
     * 处理接收到的数据
     *
     * @param buffer - 原始二进制数据
     */
    private _handle_data(buffer: ArrayBuffer): void {
        try {
            const result = this._parser(buffer);
            if (!result) return;

            const drones = Array.isArray(result) ? result : [result];

            drones.forEach(drone => {
                if (drone?.core?.sn) {
                    // 更新无人机数据
                    this._store.update(drone.core.sn, drone);

                    // 更新轨迹
                    if (this._track_store) {
                        this._track_store.append(drone.core.sn, {
                            lng: drone.core.lng,
                            lat: drone.core.lat,
                            altitude: drone.core.altitude,
                            timestamp: drone.core.last_update
                        });
                    }
                }
            });
        } catch (error) {
            console.error('Parse error:', error);
        }
    }

    /**
     * 断开连接
     */
    disconnect(): void {
        this._clear_reconnect_timer();

        if (this._ws) {
            this._ws.close(1000, 'Normal closure');
            this._ws = null;
        }

        this._set_status('disconnected');
    }

    /**
     * 发送数据
     *
     * @param data - 要发送的数据
     */
    send(data: string | ArrayBuffer): void {
        if (this._ws && this._ws.readyState === WebSocket.OPEN) {
            this._ws.send(data);
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

    /**
     * 调度重连
     */
    private _schedule_reconnect(): void {
        if (!this._config.reconnect?.enabled) return;

        const max_attempts = this._config.reconnect.max_attempts || 10;
        const initial_delay = this._config.reconnect.initial_delay || 3000;

        if (this._reconnect_attempts >= max_attempts) {
            console.error('Max reconnect attempts reached');
            return;
        }

        // 指数退避
        const delay = initial_delay * Math.pow(1.5, this._reconnect_attempts);

        this._reconnect_timer = setTimeout(async () => {
            this._reconnect_attempts++;
            try {
                await this.connect();
            } catch {
                this._schedule_reconnect();
            }
        }, delay);
    }

    /**
     * 清除重连定时器
     */
    private _clear_reconnect_timer(): void {
        if (this._reconnect_timer) {
            clearTimeout(this._reconnect_timer);
            this._reconnect_timer = null;
        }
    }
}