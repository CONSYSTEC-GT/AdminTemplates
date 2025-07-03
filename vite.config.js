import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    proxy: {
      '/WsFTP/api/ftp/upload': {
        target: 'https://certificacion.talkme.pro',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/WsFTP\/api\/ftp\/upload/, '/WsFTP/api/ftp/upload')
      },
      '/gupshup': {
        target: 'https://partner.gupshup.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gupshup/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Log para debugging
            console.log('Proxy request:', {
              path: req.url,
              headers: proxyReq.getHeaders()
            });
          });
        }
      }
    }
  }
})