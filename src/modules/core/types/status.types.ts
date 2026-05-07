/**
 * 连接状态枚举
 *
 * @description
 * - `idle` - 空闲状态，未建立任何连接
 * - `connecting` - 正在建立连接
 * - `connected` - 已连接，正常接收数据
 * - `paused` - 已暂停，连接保持但数据被丢弃
 * - `disconnecting` - 正在断开连接
 * - `error` - 连接错误
 */
export type ConnectionStatus =
    | 'idle'
    | 'connecting'
    | 'connected'
    | 'paused'
    | 'disconnecting'
    | 'error';

/**
 * 连接控制接口
 *
 * @description 提供统一的连接控制方法，屏蔽底层数据源差异
 */
export interface IConnectionControl {
    /**
     * 建立连接
     * @throws 连接失败时抛出错误
     */
    connect(): Promise<void>;

    /**
     * 断开连接
     */
    disconnect(): void;

    /**
     * 暂停数据处理
     * @description 保持底层连接，但丢弃所有接收到的数据
     */
    pause(): void;

    /**
     * 恢复数据处理
     * @description 从暂停状态恢复，开始正常处理数据
     */
    resume(): void;

    /**
     * 获取当前连接状态
     * @returns 当前状态
     */
    getStatus(): ConnectionStatus;

    /**
     * 监听状态变化
     * @param callback - 状态变化时的回调函数
     * @returns 取消监听的函数
     */
    onStatusChange(callback: (status: ConnectionStatus) => void): () => void;
}