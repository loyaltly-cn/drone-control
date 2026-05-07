export interface DroneStoreConfig {
    max_age?: number;
    auto_remove?: boolean;
}

export interface TrackStoreConfig {
    max_points?: number;
    simplify_threshold?: number;
}