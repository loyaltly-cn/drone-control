import { DroneData } from './drone.types';

export interface AppEvents {
    'drone:updated': (data: DroneData) => void;
    'drone:removed': (drone_id: string) => void;
    'track:updated': (drone_id: string, points: any[]) => void;
    'data:ready': (render_data: any) => void;
    'connection:changed': (status: string) => void;
    'error': (error: Error) => void;
}

export type EventName = keyof AppEvents;
export type EventCallback<T extends EventName> = AppEvents[T];