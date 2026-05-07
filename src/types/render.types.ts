export interface RenderTask {
    id: string;
    priority: number;
    execute: () => void;
}

export interface RenderStats {
    fps: number;
    frame_time: number;
    dropped_frames: number;
    task_count: number;
}