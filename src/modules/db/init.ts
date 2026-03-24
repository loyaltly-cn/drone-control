// db/init.ts
import { db } from './index'
import { baiduKeyService } from './baidu'
import {devices} from "./default";

const INIT_KEY = 'db_initialized'

export async function initDB() {
    const initialized = await db.sys.get(INIT_KEY)
    if (!initialized) {
        await baiduKeyService.set(import.meta.env.VITE_BAIDU_KEY || '')
        await db.sys.put({ key: INIT_KEY, value: 'true' })
        await db.devices.bulkAdd(devices)
        console.log('数据库首次初始化完成')
    }
}
