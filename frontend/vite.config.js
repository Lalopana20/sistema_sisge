import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,  // Frontend en 5173, backend en 3000 — sin conflicto
    proxy: {
      // Redirige /api/* al backend automáticamente — evita errores CORS en desarrollo
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // ✅ Configurar cookies para que funcionen con el proxy
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Reenviar cookies al backend
            if (req.headers.cookie) {
              proxyReq.setHeader('cookie', req.headers.cookie)
            }
          })
        },
      }
    }
  }
})
