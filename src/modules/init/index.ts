import {Snackbar} from "@varlet/ui";
import theme from "@/modules/theme";
import {baiduKeyService, deviceService, initDB} from "@/modules/db";
import dev from '@/modules/dev'
import pinia from "@/modules/pinia";

export default async () =>{
    console.log('init')
    await initDB()
    Snackbar.allowMultiple(true)
    theme.init()
    pinia().baidu_ak = await baiduKeyService.get()
    pinia().devices = await deviceService.getAll()
    dev(() =>{
        pinia().dev = true
        Snackbar.success('进入开发者模式')
    })
}