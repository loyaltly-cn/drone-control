// uno.config.ts
import { defineConfig, presetUno } from 'unocss'
import { presetVarlet } from '@varlet/preset-unocss'

export default defineConfig({
  presets: [presetUno(), presetVarlet()],
  rules: [
    ['md3-scroll', {
      'overflow-y': 'auto',
      'scrollbar-width': 'thin',
      'scrollbar-color': 'var(--color-text-disabled) transparent',
    }],
  ],
  variants: [
    // mobile: 前缀，屏幕 <= 450px 时生效
    (matcher) => {
      if (!matcher.startsWith('mobile:')) return matcher
      return {
        matcher: matcher.slice(7), // 去掉 mobile:
        parent: '@media (max-width: 450px)', // 媒体查询包装
      }
    },
  ],
})