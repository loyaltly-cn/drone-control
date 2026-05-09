/**基本类型报文 */
export interface MSG_base{
    /** sn码 */
    sn:string,
    /**id类型 */
    tid:number,
    /**ua类型 */
    tua:number
}

/** 位置向量报文 */
export interface MSG_pos extends PosPoint{
    /**航迹角 */
    Track_angle:number
    /**地速 */
    fly_speed:number
    vertical_speed:number
    /**气压高度 */
    pressure_altitude:number
    /**几何高度 */
    geometric_height:number
    /**距地高度 */
    altitude:number
    /**水平精度 */
    horizontal_accuracy:number
    /**垂直精度 */
    vertical_accuracy:number
    /**速度精度 */
    speed_accuracy:number
    /**时间戳*/
    timeStamp:number[]
    /**时间戳精度*/
    timeStamp_accuracy:number
}


/**系统报文 */
export interface MSG_system extends PosPoint{
    rac:number[]
    /**运行区域半径 */
    oar:number
    /**运行区域高度上限 */
    max:number
    /**运行区域高度下限 */
    min:number
    /**ua运行类别 */
    type:number
    /**ua等级 */
    level:number
    /**无人驾驶航空器控制站高度 */
    height:number
    /**时间戳 */
    timestamp:number[]

}

/**每帧的总数据 */
export interface MSG_INFO{
    base:MSG_base
    pos:MSG_pos
    system:MSG_system
}

/**飞行器控制台视图元素*/
export interface View_Control_Item{
    label:string
    val:number | string
    unit:string
}

/**无人机列表元素 */
export interface Drone_Cell_Item{
    sn:string
    type:string
    img:string
    /**是否在地图上显示*/
    show_map:boolean
    /**是否显示详细信息 */
    show_dashboard:boolean
    /**是否录制 */
    record:boolean
    /**是否在线 */
    is_online:boolean
}

/**无人机在地图上显示的model */
export interface Drone_Map_Item{
    /**飞行器经度 */
    lng:number
    /**飞行器纬度 */
    lat:number
    /**颜色 */
    color:string

}

/**无人机详细信息(看板) */
export interface Drone_Dashboard{
    list:Array<View_Control_Item>
}

export interface DroneBundle {
    sn: string;
    cell: Drone_Cell_Item;
    map: Drone_Map_Item;
    dashboard: Drone_Dashboard;
    lastUpdate: number;  // 用于离线检测
}

export interface PosPoint{
    /**飞行器控制器经度 */
    lng:number
    /**飞行器控制器纬度 */
    lat:number
}

export type MSG_Type = 'BASE'|'POS'|'SYSTEM'

export interface UomRepBody{
    msg:string
    code:number
    uomUavRegist:UomUavRegist
}

export interface UomUavRegist{
    uasCode:number|null
    shengccsmc:string
    chanpxh:string
    chanpmc:string
    /**注册人员/单位名称 */
    xingm:string|null
    /**phone*/
    shoujhm:string|null
}