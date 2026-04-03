// db/baiduMap.ts
import { db } from './index'

const KEY = 'map_key'

export const baiduKeyService = {
    set: (key: string) => db.config.put({ key: KEY, value: key }),
    get: () => db.config.get(KEY).then(s => s?.value || ''),
    remove: () => db.config.delete(KEY),
    exists: () => db.config.get(KEY).then(s => !!s)
}
