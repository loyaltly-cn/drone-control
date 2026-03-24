// db/index.ts
import Dexie from 'dexie'
import type { Device } from './devices'

class AppDB extends Dexie {
    // 系统配置（初始化标志、版本等）
    sys!: Dexie.Table<{ key: string; value: string }, string>
    // 用户配置（百度key等）
    config!: Dexie.Table<{ key: string; value: string }, string>
    // 设备数据
    devices!: Dexie.Table<Device, string>

    constructor() {
        super('XU_Drone')
        this.version(2).stores({
            sys: 'key',
            config: 'key',
            devices: 'sn'
        })
    }
}

export const db = new AppDB()
export * from './baidu'
export * from './devices'
export * from './init'
