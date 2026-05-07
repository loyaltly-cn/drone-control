/**
 * 渲染调度器
 *
 * @description
 * 基于 requestAnimationFrame 的渲染循环调度器。
 * 处理页面可见性变化，在切回前台时触发恢复回调。
 * 定时检查无人机离线状态。
 */
export class RenderScheduler {
    /** RAF 句柄 */
    private _raf_id: number | null = null;
    /** 是否正在运行 */
    private _is_running: boolean = false;
    /** 离线检查定时器 */
    private _offline_timer: ReturnType<typeof setInterval> | null = null;
    /** 帧回调列表 */
    private _on_frame_callbacks: Array<() => void> = [];
    /** 恢复回调列表（页面切回前台时触发） */
    private _on_restore_callbacks: Array<() => void> = [];
    /** 离线检查回调 */
    private _on_check_offline: (() => void) | null = null;

    constructor() {
        // 监听页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this._handle_restore();
            }
        });
    }

    /**
     * 注册帧回调
     *
     * @description 每帧渲染时调用
     * @param callback - 回调函数
     * @returns 取消注册的函数
     */
    onFrame(callback: () => void): () => void {
        this._on_frame_callbacks.push(callback);
        return () => {
            const idx = this._on_frame_callbacks.indexOf(callback);
            if (idx > -1) this._on_frame_callbacks.splice(idx, 1);
        };
    }

    /**
     * 注册恢复回调
     *
     * @description 页面从后台切回前台时调用
     * @param callback - 回调函数
     * @returns 取消注册的函数
     */
    onRestore(callback: () => void): () => void {
        this._on_restore_callbacks.push(callback);
        return () => {
            const idx = this._on_restore_callbacks.indexOf(callback);
            if (idx > -1) this._on_restore_callbacks.splice(idx, 1);
        };
    }

    /**
     * 设置离线检查回调
     *
     * @description 每秒调用一次，用于检查无人机是否超时离线
     * @param callback - 回调函数
     */
    setOfflineChecker(callback: () => void): void {
        this._on_check_offline = callback;
    }

    /**
     * 启动调度器
     */
    start(): void {
        if (this._is_running) return;
        this._is_running = true;

        // 启动 RAF 循环
        this._loop();

        // 启动离线检查定时器（每秒）
        this._offline_timer = setInterval(() => {
            if (this._on_check_offline) {
                this._on_check_offline();
            }
        }, 1000);
    }

    /**
     * 停止调度器
     */
    stop(): void {
        this._is_running = false;

        if (this._raf_id) {
            cancelAnimationFrame(this._raf_id);
            this._raf_id = null;
        }

        if (this._offline_timer) {
            clearInterval(this._offline_timer);
            this._offline_timer = null;
        }
    }

    /**
     * 是否正在运行
     */
    get isRunning(): boolean {
        return this._is_running;
    }

    /**
     * RAF 主循环
     */
    private _loop = (): void => {
        if (!this._is_running) return;

        this._raf_id = requestAnimationFrame(() => {
            // 执行所有帧回调
            this._on_frame_callbacks.forEach(cb => {
                try {
                    cb();
                } catch (e) {
                    console.error('Frame callback error:', e);
                }
            });
            this._loop();
        });
    };

    /**
     * 处理页面恢复
     */
    private _handle_restore(): void {
        this._on_restore_callbacks.forEach(cb => {
            try {
                cb();
            } catch (e) {
                console.error('Restore callback error:', e);
            }
        });
    }
}