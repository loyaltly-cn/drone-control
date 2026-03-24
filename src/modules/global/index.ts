
export default reactive<Global>({
    baidu_ak:'',
    dev:false,
    devices:[],
});

/**全局共享变量池 */
interface Global {
    /**百度地图ak */
    baidu_ak: string;
    /**无人机sn对应型号&color */
    devices:Array<Devices>
    /**开发者模式*/
    dev:boolean

}

interface Devices{
    sn:string
    type:string
    color:string
}

