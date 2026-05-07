import { TrackPoint } from '../types';

/**
 * 轨迹数据存储
 *
 * @description
 * 管理无人机的飞行轨迹，自动限制点数防止内存溢出。
 */
export class TrackStore {
    /** 轨迹存储，key 为 SN */
    private _tracks: Map<string, TrackPoint[]> = new Map();
    /** 每个无人机最大轨迹点数 */
    private _max_points: number;

    /**
     * 构造函数
     *
     * @param max_points - 每个无人机最大轨迹点数，默认 5000
     */
    constructor(max_points: number = 5000) {
        this._max_points = max_points;
    }

    /**
     * 追加轨迹点
     *
     * @param sn - 无人机序列号
     * @param point - 轨迹点
     */
    append(sn: string, point: TrackPoint): void {
        let track = this._tracks.get(sn);
        if (!track) {
            track = [];
            this._tracks.set(sn, track);
        }

        track.push(point);

        // 超出限制时移除最旧的点
        if (track.length > this._max_points) {
            track.splice(0, track.length - this._max_points);
        }
    }

    /**
     * 获取指定无人机的轨迹
     *
     * @param sn - 无人机序列号
     * @returns 轨迹点数组
     */
    get(sn: string): TrackPoint[] {
        return this._tracks.get(sn) || [];
    }

    /**
     * 获取所有轨迹
     *
     * @returns 所有轨迹的副本
     */
    getAll(): Map<string, TrackPoint[]> {
        return new Map(this._tracks);
    }

    /**
     * 清空轨迹
     *
     * @param sn - 可选，指定无人机的 SN，不传则清空所有
     */
    clear(sn?: string): void {
        if (sn) {
            this._tracks.delete(sn);
        } else {
            this._tracks.clear();
        }
    }
}