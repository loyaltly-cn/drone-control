export type DataSourceType = 'websocket' | 'serial' | 'mock';

export type DataSourceState =
    | 'disconnected'
    | 'connecting'
    | 'connected'
    | 'error'
    | 'reconnecting';

export interface IDataSourceConfig {
    type: DataSourceType;
    id: string;
    name?: string;
    enabled?: boolean;
    reconnect?: ReconnectConfig;
    heartbeat?: HeartbeatConfig;
}

export interface ReconnectConfig {
    enabled: boolean;
    max_attempts: number;
    initial_delay: number;
    max_delay: number;
    backoff_multiplier: number;
}

export interface HeartbeatConfig {
    enabled: boolean;
    interval: number;
    timeout: number;
    message?: string | Uint8Array;
}

export interface DataSourceStats {
    bytes_received: number;
    packets_received: number;
    last_packet_time: number;
    connection_time: number;
    reconnect_count: number;
}

export interface WebSocketConfig extends IDataSourceConfig {
    type: 'websocket';
    url: string;
    protocols?: string | string[];
    binary_type?: BinaryType;
}

export interface SerialPortConfig extends IDataSourceConfig {
    type: 'serial';
    baud_rate: number;
    data_bits?: 7 | 8;
    stop_bits?: 1 | 2;
    parity?: 'none' | 'even' | 'odd';
    flow_control?: boolean;
    buffer_size?: number;
}

export interface MockConfig extends IDataSourceConfig {
    type: 'mock';
    interval: number;
}