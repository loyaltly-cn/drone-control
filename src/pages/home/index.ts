import {CoreSource} from "@/modules/core";

const popup = reactive({
    drone_cell:false,
    setting:false,
})

const state = reactive({
    connect:false,
    pause:false
})

const obj = {
    source:'websocket' as CoreSource
}

export {
    obj,
    popup,
    state
}