/**
 * 无人机核心数据
 *
 * @description 高频变化的数据，用于地图实时渲染
 */
export interface DroneCoreData {
    /** 序列号，全局唯一标识 */
    sn: string;
    /** 经度 */
    lng: number;
    /** 纬度 */
    lat: number;
    /** 距地高度（米） */
    altitude: number;
    /** 垂直速度（米/秒） */
    altitude_speed: number;
    /** 速度（米/秒） */
    speed?: number;
    /** 航向（度，0-360） */
    heading: number;
    /** 最后更新时间戳（毫秒） */
    last_update: number;
    /** 无人机名称 */
    name:string;
    /** 气压高度 */
    pressure_altitude:number;
    /** 几何高度 */
    geometric_height:number;
    /** 控制器纬度 */
    con_lat:number;
    /** 控制器经度 */
    con_lng:number;
    /** 运行区域半径 */
    radius:number
    max:number
    min:number
}

/**
 * 无人机业务数据
 *
 * @description 低频变化的数据，用于侧边栏和详情面板展示
 */
export interface DroneBusinessData {
    /** 设备类型 */
    type?: string;
    /** 设备型号 */
    model?: string;
    /** 电池电量（百分比，0-100） */
    battery?: number;
    /** 温度（摄氏度） */
    temperature?: number;
    /** 信号强度（dBm） */
    signal?: number;
    /** 飞行状态 */
    status?: string;
    /** 固件版本 */
    firmware?: string;
    /** 其他扩展字段 */
    [key: string]: any;
}

/**
 * 完整无人机数据
 *
 * @description 包含核心数据和业务数据
 */
export interface DroneData {
    /** 核心数据（高频） */
    core: DroneCoreData;
    /** 业务数据（低频） */
    business: DroneBusinessData;
}

/**
 * 侧边栏列表项
 *
 * @description 用于侧边栏列表展示的精简数据结构
 */
export interface DroneListItem {
    /** 序列号 */
    sn: string;
    /** 设备类型 */
    type?: string;
    /** 设备型号 */
    model?: string;
    /** 电池电量 */
    battery?: number;
    /** 飞行状态 */
    status?: string;
    /** 最后更新时间戳 */
    last_update: number;
    /** 是否在线 */
    is_online: boolean;
}

/**
 * 轨迹点
 *
 * @description 用于绘制无人机飞行轨迹
 */
export interface TrackPoint {
    /** 经度 */
    lng: number;
    /** 纬度 */
    lat: number;
    /** 高度（米） */
    altitude?: number;
    /** 时间戳（毫秒） */
    timestamp: number;
}