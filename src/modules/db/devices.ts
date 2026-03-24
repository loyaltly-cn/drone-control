// db/devices.ts
import { db } from './index'

export interface Device {
    sn: string
    type: string
    color: string
}

export const deviceService = {
    add: (device: Device) => db.devices.put(device),
    delete: (sn: string) => db.devices.delete(sn),
    update: (sn: string, changes: Partial<Device>) => db.devices.update(sn, changes),
    get: (sn: string) => db.devices.get(sn),
    getAll: () => db.devices.toArray(),
    getByType: (type: string) => db.devices.where('type').equals(type).toArray()
}
