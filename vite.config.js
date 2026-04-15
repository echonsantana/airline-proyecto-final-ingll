import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: './',
  base: '/airline-proyecto-final-ingll/',

  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        reservas: resolve(__dirname, 'reservas.html'),
        admin: resolve(__dirname, 'admin.html'),
      }
    }
  }
})