import { createApp } from "vue";
import App from "./App.vue";
import Varlet from '@varlet/ui'
import init from './modules/init'
import router from "./modules/router";
import '@varlet/ui/es/style'
import '@varlet/touch-emulator'
import 'virtual:uno.css'
import '@/css/global.css'
import '@/css/transition.css'
import '@/css/adaptive.css'


createApp(App)
.use(Varlet)
.use(router)
.mount("#app")
.$nextTick().then(_ => init());
