import {Snackbar} from "@varlet/ui";
import theme from "../theme";
import {baiduKeyService, deviceService, initDB} from "../db";
import global from "../global";
import dev from '../dev'

export default async () =>{
    console.log('init')
    await initDB()
    Snackbar.allowMultiple(true)
    theme.init()
    global.baidu_ak = await baiduKeyService.get()
    console.log('init global devices')
    global.devices = await deviceService.getAll()
    console.log(global.devices)
    dev(() =>{
        global.dev = true
        Snackbar.success('进入开发者模式')
    })
}