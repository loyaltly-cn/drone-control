import {DroneMonitor} from "@/modules/core";
import {parse_drone_data} from "@/modules/parser";

const monitor = new DroneMonitor({
    source:'websocket',
    websocket:{
        url:'ws://218.93.177.50:8082/ws'
    },
    parser:parse_drone_data,
    enable_track:true
})

monitor.onDiff(diff =>{
    console.log(diff)
})


const init = () =>{
}

// 4. 控制方法
async function handleConnect() {
    await monitor.connect();
}

function handlePause() {
    monitor.pause();
}

function handleResume() {
    monitor.resume();
}

function handleDisconnect() {
    monitor.disconnect();
}

export default {
    init,
    handleConnect,
    handlePause,
    handleResume,
    handleDisconnect,
}