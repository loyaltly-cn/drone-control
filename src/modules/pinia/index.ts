import {defineStore} from "pinia";
import {PiniaStore} from "@/types";

export default defineStore('pinia',() => reactive<PiniaStore>({
    baidu_ak:'',
    dev:false ,
    devices:[],
}))

