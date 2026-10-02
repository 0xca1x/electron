import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    electron({
      entry: 'src/main/index.ts',
      vite: { build: { outDir: 'out/main' } }
    })
  ],
  build: { outDir: 'out/renderer' }
})
