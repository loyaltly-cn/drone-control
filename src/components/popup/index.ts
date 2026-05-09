import { createApp, h } from 'vue'
import com from './index.vue'

export function createPopupEl(props: any, onLine?: (sn: string) => void) {
    const container = document.createElement('div')

    const app = createApp({
        render() {
            return h(com, {
                ...props,
                onLine: onLine  // 绑定 @line 事件
            })
        }
    })

    app.mount(container)
    return container
}
