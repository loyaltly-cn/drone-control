import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import components from 'unplugin-vue-components/vite'
import autoImport from 'unplugin-auto-import/vite'
import { VarletImportResolver } from '@varlet/import-resolver'
import UnoCSS from 'unocss/vite'
import { resolve } from 'path'
import JSX from '@vitejs/plugin-vue-jsx'
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [
    UnoCSS(),
    JSX(),
    vue(),
     components({
      resolvers: [VarletImportResolver()],
      dirs:['src/components'],
      extensions:['vue','jsx','tsx'],
      deep:true,
      dts: 'src/components.d.ts'
    }),
    autoImport({
      resolvers: [VarletImportResolver({ autoImport: true })],
       imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts'
    })
  ],
  resolve:{
    alias:{
      '@': resolve(__dirname,'src/'),
      '@pages': resolve(__dirname, 'src/pages')
    }
  },
  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 8888,
    strictPort: true,
    // host: host || false,
    host: '0.0.0.0',
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 8888,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
