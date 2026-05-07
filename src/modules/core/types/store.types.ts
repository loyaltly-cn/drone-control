import { DroneData } from './drone.types';

/**
 * Store 增量变化数据
 *
 * @description 描述一轮更新中新增、更新、删除的数据
 */
export interface StoreDiff {
    /** 新增的无人机，key 为 SN */
    added: Map<string, DroneData>;
    /** 更新的无人机，key 为 SN */
    updated: Map<string, DroneData>;
    /** 删除的无人机 SN */
    removed: Set<string>;
}

/**
 * Store 变化回调函数类型
 *
 * @param diff - 增量变化数据
 */
export type StoreCallback = (diff: StoreDiff) => void;