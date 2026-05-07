export interface DronePosition {
    lng: number;
    lat: number;
    altitude?: number;
}

export interface DroneTelemetry {
    speed: number;
    heading: number;
    battery: number;
    temperature: number;
    humidity?: number;
    signal_strength?: number;
}

export interface DroneData {
    drone_id: string;
    device_id: string;
    position: DronePosition;
    telemetry: DroneTelemetry;
    timestamp: number;
    raw_data?: Uint8Array;
}

export interface TrackPoint {
    lng: number;
    lat: number;
    altitude?: number;
    timestamp: number;
}

// 渲染用的数据结构
export interface RenderData {
    drones: Map<string, DroneData>;
    tracks: Map<string, TrackPoint[]>;
    selected_drone_id: string | null;
}