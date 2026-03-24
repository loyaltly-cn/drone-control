
// 设备类型信息（创建时需要）
import {DroneBundle, MSG_INFO, View_Control_Item} from "@/types";

interface DeviceType {
    type: string;
    color: string;
}

// 三个对象的捆绑包

class DroneStore {
    // 核心：SN -> 捆绑包
    private drones = new Map<string, DroneBundle>();

    // ========== 只读视图（给 Vue 用）==========

    get list(): DroneBundle[] {
        return Array.from(this.drones.values());
    }

    get stats() {
        const all = this.list;
        const online = all.filter(d => d.cell.is_online).length;
        return {
            total: all.length,
            online,
            offline: all.length - online
        };
    }

    // ========== 核心操作（O(1)）==========

    // 获取或创建（最重要）
    getOrCreate(sn: string, deviceType?: DeviceType): DroneBundle {
        let bundle = this.drones.get(sn);

        if (!bundle) {
            bundle = {
                sn,
                cell: {
                    sn,
                    type: deviceType?.type || 'Unknown',
                    img:`/drone/${deviceType?.type || 'Unknown'}.jpg`,
                    show_map: false,
                    show_dashboard: false,
                    record: false,
                    is_online: true
                },
                map: {
                    lng: 0,
                    lat: 0,
                    color: deviceType?.color || '#1890ff',
                },
                dashboard: {
                    list: []
                },
                lastUpdate: Date.now()
            };

            this.drones.set(sn, bundle);
        }

        return bundle;
    }

    // 一键更新整帧数据
    updateFromFrame(info: MSG_INFO, deviceType?: DeviceType): DroneBundle {
        const bundle = this.getOrCreate(info.base.sn, deviceType);

        // 更新基础信息
        bundle.cell.is_online = true;

        // 更新位置（如果有）
        if (info.pos) {
            bundle.map.lat = info.pos.lat;
            bundle.map.lng = info.pos.lng;
            bundle.dashboard.list = this.coverToDashboard(info);
        }

        // 更新系统信息（如果有）
        if (info.system) {

        }

        bundle.lastUpdate = Date.now();
        return bundle;
    }

    // 单独更新位置（快速接口）
    updatePosition(sn: string, lat: number, lng: number): boolean {
        const bundle = this.drones.get(sn);
        if (!bundle) return false;

        bundle.map.lat = lat;
        bundle.map.lng = lng;
        bundle.lastUpdate = Date.now();
        return true;
    }

    // 获取单个（O(1)）
    get(sn: string): DroneBundle | undefined {
        return this.drones.get(sn);
    }

    // 检查存在
    has(sn: string): boolean {
        return this.drones.has(sn);
    }

    // 删除
    remove(sn: string): boolean {
        return this.drones.delete(sn);
    }

    // 标记离线
    markOffline(sn: string): boolean {
        const bundle = this.drones.get(sn);
        if (!bundle) return false;

        bundle.cell.is_online = false;
        return true;
    }

    // 清理超时设备
    cleanup(timeoutMs: number): string[] {
        const now = Date.now();
        const removed: string[] = [];

        this.drones.forEach((bundle, sn) => {
            if (now - bundle.lastUpdate > timeoutMs) {
                this.markOffline(sn);
                removed.push(sn);
            }
        });

        return removed;
    }

    // ========== 辅助方法 ==========

    private coverToDashboard(info: MSG_INFO): View_Control_Item[] {
        return [
            { label: '航迹角', val: info.pos.Track_angle, unit: '度' },
            { label: '地速', val: info.pos.fly_speed, unit: 'm/s' },
            { label: '经度', val: info.pos.lng, unit: '' },
            { label: '纬度', val: info.pos.lat, unit: '' },
            { label: '控制器经度', val: info.system.lng, unit: '' },
            { label: '控制器纬度', val: info.system.lat, unit: '' },
            { label: '垂直速度', val: info.pos.vertical_speed, unit: '' },
            { label: '气压高度', val: info.pos.pressure_altitude.toString(), unit: 'm' },
            { label: '几何高度', val: info.pos.geometric_height.toString(), unit: 'm' },
            { label: '距地高度', val: info.pos.altitude.toString(), unit: 'm' },
        ];
    }
}

// 单例导出
export const droneStore = new DroneStore();
