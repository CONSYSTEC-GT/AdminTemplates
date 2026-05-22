import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // VITE_BASE_PATH permite desplegar bajo cualquier subpath sin recompilar si se usa './'.
  // Valores posibles:
  //   './'                   → relativo, funciona en cualquier subpath (default)
  //   '/'                    → raíz (dominio propio sin subpath)
  //   '/adminTemplates/'     → subpath fijo con reverse proxy
  const base = env.VITE_BASE_PATH || './'
  return {
    base,
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
  }
})