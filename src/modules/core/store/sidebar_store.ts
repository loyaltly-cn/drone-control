import { DroneData, DroneListItem } from '../types';

/**
 * 侧边栏数据存储
 *
 * @description
 * 管理侧边栏列表数据，自动处理在线/离线状态。
 * 从 DroneData 中提取必要字段，减少渲染开销。
 */
export class SidebarStore {
    /** 列表项存储 */
    private _items: Map<string, DroneListItem> = new Map();
    /** 变化监听器 */
    private _callbacks: Array<(list: DroneListItem[]) => void> = [];
    /** 离线超时时间（毫秒） */
    private _offline_timeout: number;

    /**
     * 构造函数
     *
     * @param offline_timeout - 离线超时时间（毫秒），超时未收到数据则标记为离线
     */
    constructor(offline_timeout: number = 10000) {
        this._offline_timeout = offline_timeout;
    }

    /**
     * 从 DroneData 更新列表项
     *
     * @param sn - 无人机序列号
     * @param data - 无人机完整数据
     */
    updateFromDrone(sn: string, data: DroneData): void {
        const item: DroneListItem = {
            sn,
            type: data.business.type,
            model: data.business.model,
            battery: data.business.battery,
            status: data.business.status,
            last_update: data.core.last_update,
            is_online: true
        };

        this._items.set(sn, item);
        this._notify();
    }

    /**
     * 标记无人机为离线
     *
     * @param sn - 无人机序列号
     */
    setOffline(sn: string): void {
        const item = this._items.get(sn);
        if (item) {
            item.is_online = false;
            this._notify();
        }
    }

    /**
     * 移除无人机
     *
     * @param sn - 无人机序列号
     */
    remove(sn: string): void {
        this._items.delete(sn);
        this._notify();
    }

    /**
     * 获取列表数据
     *
     * @returns 按更新时间倒序排列的列表
     */
    getList(): DroneListItem[] {
        return Array.from(this._items.values())
            .sort((a, b) => b.last_update - a.last_update);
    }

    /**
     * 检查离线状态
     *
     * @description 应定时调用，检查是否有超时未更新的无人机
     */
    checkOffline(): void {
        const now = Date.now();
        let changed = false;

        this._items.forEach((item, _sn) => {
            if (item.is_online && now - item.last_update > this._offline_timeout) {
                item.is_online = false;
                changed = true;
            }
        });

        if (changed) {
            this._notify();
        }
    }

    /**
     * 监听列表变化
     *
     * @param callback - 列表变化时的回调函数
     * @returns 取消监听的函数
     */
    onChange(callback: (list: DroneListItem[]) => void): () => void {
        this._callbacks.push(callback);
        return () => {
            const idx = this._callbacks.indexOf(callback);
            if (idx > -1) this._callbacks.splice(idx, 1);
        };
    }

    /**
     * 通知所有监听器
     */
    private _notify(): void {
        const list = this.getList();
        this._callbacks.forEach(cb => cb(list));
    }

    /**
     * 清空所有数据
     */
    clear(): void {
        this._items.clear();
        this._notify();
    }
}