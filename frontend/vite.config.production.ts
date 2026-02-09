import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production конфигурация (для Vercel/Render)
// Использует прямые URL к backend вместо прокси

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Отключить sourcemaps для production
  },
})
