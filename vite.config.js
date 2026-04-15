import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base:'https://echonsantana.github.io/airline-proyecto-final-ingll.git'
})
