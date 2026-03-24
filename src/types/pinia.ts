/**全局共享变量池 */
export interface PiniaStore {
    /**百度地图ak */
    baidu_ak: string;
    /**无人机sn对应型号&color */
    devices:Array<Devices>
    /**开发者模式*/
    dev:boolean

}

export interface Devices{
    sn:string
    type:string
    color:string
}
