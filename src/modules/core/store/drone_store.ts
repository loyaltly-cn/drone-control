import { DroneData, StoreDiff, StoreCallback } from '../types';

/**
 * 无人机数据存储
 *
 * @description
 * 负责存储所有在线无人机的实时数据，并在每帧 flush 时计算增量变化。
 * 只有核心数据（位置、速度、航向）变化才会触发 updated 事件。
 */
export class DroneStore {
    /** 当前数据 */
    private _drones: Map<string, DroneData> = new Map();
    /** 上一帧数据（用于计算差异） */
    private _prev_drones: Map<string, DroneData> = new Map();
    /** 变化监听器列表 */
    private _callbacks: StoreCallback[] = [];

    /**
     * 更新无人机数据
     *
     * @param sn - 无人机序列号
     * @param data - 无人机完整数据
     */
    update(sn: string, data: DroneData): void {
        this._drones.set(sn, { ...data });
    }

    /**
     * 移除无人机
     *
     * @param sn - 无人机序列号
     */
    remove(sn: string): void {
        this._drones.delete(sn);
    }

    /**
     * 计算变化并通知监听器
     *
     * @description 此方法应在每帧渲染前调用
     */
    flush(): void {
        const added = new Map<string, DroneData>();
        const updated = new Map<string, DroneData>();
        const removed = new Set<string>();

        // 查找新增和更新
        this._drones.forEach((data, sn) => {
            const prev = this._prev_drones.get(sn);
            if (!prev) {
                added.set(sn, data);
            } else if (this._has_core_changed(prev, data)) {
                updated.set(sn, data);
            }
        });

        // 查找删除
        this._prev_drones.forEach((_, sn) => {
            if (!this._drones.has(sn)) {
                removed.add(sn);
            }
        });

        // 保存当前快照供下次比较
        this._prev_drones = new Map(this._drones);

        // 有变化才通知
        if (added.size > 0 || updated.size > 0 || removed.size > 0) {
            const diff: StoreDiff = { added, updated, removed };
            this._callbacks.forEach(cb => cb(diff));
        }
    }

    /**
     * 判断核心数据是否发生变化
     *
     * @param prev - 上一帧数据
     * @param curr - 当前数据
     * @returns 是否变化
     */
    private _has_core_changed(prev: DroneData, curr: DroneData): boolean {
        const p = prev.core;
        const c = curr.core;

        return p.lng !== c.lng ||
            p.lat !== c.lat ||
            p.altitude !== c.altitude ||
            p.speed !== c.speed ||
            p.heading !== c.heading;
    }

    /**
     * 获取单个无人机数据
     *
     * @param sn - 无人机序列号
     * @returns 无人机数据，不存在则返回 undefined
     */
    get(sn: string): DroneData | undefined {
        return this._drones.get(sn);
    }

    /**
     * 获取所有无人机数据
     *
     * @returns 所有无人机数据的副本
     */
    getAll(): Map<string, DroneData> {
        return new Map(this._drones);
    }

    /**
     * 监听数据变化
     *
     * @param callback - 变化时的回调函数
     * @returns 取消监听的函数
     */
    onChange(callback: StoreCallback): () => void {
        this._callbacks.push(callback);
        return () => {
            const idx = this._callbacks.indexOf(callback);
            if (idx > -1) this._callbacks.splice(idx, 1);
        };
    }

    /**
     * 清空所有数据
     */
    clear(): void {
        this._drones.clear();
        this._prev_drones.clear();
    }
}