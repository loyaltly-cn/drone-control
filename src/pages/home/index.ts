import {DroneBundle} from "@/types";
import {BarButton,Mode} from "./types";

export default reactive({
    mode:'default' as Mode,
    state:{
        connect:false,
        dev:false,
        record:false,
        popup:{
            setting:false,
            replay:false,
            record:false
        }
    },
    list:[] as Array<DroneBundle>,
    stats:{
        total: 0,
        online:0,
        offline:0
    },
    raw:Uint8Array,
    bar_button:[] as BarButton[],
    record_drone:{} as DroneBundle,
    current_drone:{} as DroneBundle,
})