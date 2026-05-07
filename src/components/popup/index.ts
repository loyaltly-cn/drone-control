// popup.ts
import { createApp } from 'vue'
import com from './index.vue'

export function createPopupEl(props: any) {
    const container = document.createElement('div')
    createApp(com, props).mount(container)
    console.log('createPopup')
    return container
}