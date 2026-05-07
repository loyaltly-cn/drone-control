/** 类型定义 */
export * from './types';

/** 存储模块 */
export * from './store';

/** 调度器 */
export { RenderScheduler } from './scheduler';

/** 数据源 */
export * from './source';

// ========== 主类 ==========

import { DroneStore, SidebarStore, TrackStore } from './store';
import { WebSocketSource, SerialSource } from './source';
import { RenderScheduler } from './scheduler';
import type {
    DroneData,
    TrackPoint,
    StoreDiff,
    DroneListItem,
    ConnectionStatus,
    CoreConfig,
    Parser
} from './types';

export class DroneMonitor {
    private readonly _store: DroneStore;
    private _sidebar_store: SidebarStore;
    private readonly _track_store: TrackStore | null = null;
    private _source: WebSocketSource | SerialSource | null = null;
    private _scheduler: RenderScheduler;
    private readonly _config: CoreConfig;

    private _status: ConnectionStatus = 'idle';
    private _status_callbacks: Array<(status: ConnectionStatus) => void> = [];
    private _data_enabled: boolean = true;
    private _on_full_update: ((drones: Map<string, DroneData>, tracks: Map<string, TrackPoint[]>) => void) | null = null;

    constructor(config: CoreConfig) {
        this._config = config;
        this._store = new DroneStore();
        this._sidebar_store = new SidebarStore(config.offline_timeout || 10000);
        this._scheduler = new RenderScheduler();

        if (config.enable_track) {
            this._track_store = new TrackStore(config.track_max_points || 5000);
        }

        this._init_source();
        this._setup_scheduler();
        this._setup_sidebar_sync();
    }

    private _init_source(): void {
        const { source, websocket, serial, parser } = this._config;

        const wrapped_parser: Parser = (buffer: ArrayBuffer) => {
            if (!this._data_enabled) return null;
            return parser(buffer);
        };

        if (source === 'websocket' && websocket) {
            this._source = new WebSocketSource(
                websocket,
                this._store,
                wrapped_parser,
                this._track_store || undefined
            );
        } else if (source === 'serial' && serial) {
            this._source = new SerialSource(serial, this._store, wrapped_parser);
        } else {
            throw new Error('Invalid source configuration');
        }

        this._source.onStatusChange(() => this._sync_status());
    }

    private _setup_scheduler(): void {
        this._scheduler.onFrame(() => this._store.flush());

        this._scheduler.onRestore(() => {
            if (this._on_full_update) {
                this._on_full_update(
                    this._store.getAll(),
                    this._track_store?.getAll() || new Map()
                );
            }
        });

        this._scheduler.setOfflineChecker(() => {
            this._sidebar_store.checkOffline();
        });
    }

    private _setup_sidebar_sync(): void {
        this._store.onChange((diff) => {
            diff.added.forEach((data, sn) => this._sidebar_store.updateFromDrone(sn, data));
            diff.updated.forEach((data, sn) => this._sidebar_store.updateFromDrone(sn, data));
            diff.removed.forEach(sn => this._sidebar_store.setOffline(sn));
        });
    }

    private _sync_status(): void {
        let new_status: ConnectionStatus = 'idle';

        if (!this._source) {
            new_status = 'idle';
        } else if (this._source.status === 'connecting') {
            new_status = 'connecting';
        } else if (this._source.status === 'connected') {
            new_status = this._data_enabled ? 'connected' : 'paused';
        }

        if (this._status !== new_status) {
            this._status = new_status;
            this._status_callbacks.forEach(cb => cb(new_status));
        }
    }

    // ========== 控制 API ==========

    async connect(): Promise<void> {
        if (this._status === 'connected' || this._status === 'paused') return;
        this._status = 'connecting';
        this._status_callbacks.forEach(cb => cb('connecting'));

        try {
            await this._source?.connect();
            this._scheduler.start();
            this._data_enabled = true;
            this._status = 'connected';
            this._status_callbacks.forEach(cb => cb('connected'));
        } catch (error) {
            this._status = 'error';
            this._status_callbacks.forEach(cb => cb('error'));
            throw error;
        }
    }

    disconnect(): void {
        this._status = 'disconnecting';
        this._status_callbacks.forEach(cb => cb('disconnecting'));
        this._scheduler.stop();
        this._source?.disconnect();
        this._data_enabled = true;
        this._status = 'idle';
        this._status_callbacks.forEach(cb => cb('idle'));
    }

    pause(): void {
        if (this._status !== 'connected') return;
        this._data_enabled = false;
        this._status = 'paused';
        this._status_callbacks.forEach(cb => cb('paused'));
    }

    resume(): void {
        if (this._status !== 'paused') return;
        this._data_enabled = true;
        this._status = 'connected';
        this._status_callbacks.forEach(cb => cb('connected'));
    }

    getStatus(): ConnectionStatus {
        return this._status;
    }

    onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
        this._status_callbacks.push(callback);
        return () => {
            const idx = this._status_callbacks.indexOf(callback);
            if (idx > -1) this._status_callbacks.splice(idx, 1);
        };
    }

    // ========== 数据 API ==========

    destroy(): void {
        this.disconnect();
        this._store.clear();
        this._sidebar_store.clear();
        this._track_store?.clear();
        this._status_callbacks = [];
        this._on_full_update = null;
    }

    onDiff(callback: (diff: StoreDiff) => void): () => void {
        return this._store.onChange(callback);
    }

    onSidebarChange(callback: (list: DroneListItem[]) => void): () => void {
        return this._sidebar_store.onChange(callback);
    }

    onFullUpdate(callback: (drones: Map<string, DroneData>, tracks: Map<string, TrackPoint[]>) => void): () => void {
        this._on_full_update = callback;
        return () => { this._on_full_update = null; };
    }

    getDrone(sn: string): DroneData | undefined {
        return this._store.get(sn);
    }

    getAllDrones(): Map<string, DroneData> {
        return this._store.getAll();
    }

    getTrack(sn: string): TrackPoint[] {
        return this._track_store?.get(sn) || [];
    }

    send(data: string | ArrayBuffer | Uint8Array): void {
        if (this._source instanceof WebSocketSource) {
            this._source.send(data as string | ArrayBuffer);
        } else if (this._source instanceof SerialSource) {
            this._source.send(data as Uint8Array);
        }
    }
}