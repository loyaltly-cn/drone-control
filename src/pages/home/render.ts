import obj from "./index.ts";
import {Snackbar} from "@varlet/ui";
import router from "../../modules/router";
import even from './even'

export default {
    theme:[{
        label:'跟随系统',
        value:'default'
    },{
        label:'暗色',
        value:'dark'
    },{
        label:'md3-暗色',
        value:'md3-dark'
    },{
        label:'md3-亮色',
        value:'md3-light'
    }],
    bar:{
        default:[{
            label:'轨迹录制',
            func:() => obj.state.connect?obj.state.popup.record = true:Snackbar.error('请先连接设备')
        },{
            label:'运动轨迹',
            func:() => obj.state.popup.replay = true
        },{
            label:'设置',
            func:() => obj.state.popup.setting = true
        },{
            label:'管理',
            func:() => router.push('manage-devices')
        }],
        record:[{
            label:'重置',
            func:() => even.reset()
        },{
            label:'定位',
            func:() => even.pos()
        },{
            label:'保存',
            func:() =>{

            }
        },{
            label:'退出',
            func:() =>{

            }
        }]
    }
}