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
      '&::-webkit-scrollbar': { width: '6px', height: '6px' },
      '&::-webkit-scrollbar-track': { background: 'transparent' },
      '&::-webkit-scrollbar-thumb': { 
        background: 'var(--color-text-disabled)', 
        borderRadius: '3px',
        transition: 'background 0.2s'
      },
      '&::-webkit-scrollbar-thumb:hover': { 
        background: 'var(--color-text-secondary)' 
      },
      '&::-webkit-scrollbar-corner': { background: 'transparent' },
    }],
  ],
})