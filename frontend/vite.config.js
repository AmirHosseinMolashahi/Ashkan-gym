import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0',
    port: 5173,

    watch: {
      usePolling: true
    },

    proxy: {
      '/api': {
        target: 'http://backend:8000',
        secure: false,
        changeOrigin: true,

        headers: {
          Host: 'localhost:8000'
        },

        rewrite: path => path.replace(/^\/api/, '')
      },

      '/media': {
        target: 'http://backend:8000',
        secure: false,
        changeOrigin: true,

        headers: {
          Host: 'localhost:8000'
        }
      }
    }
  }
})