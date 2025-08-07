import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'process'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    base: env.VITE_BASE_URL,          // Xác dịnh base url cho các liên kết tĩnh 
    plugins: [react()],
    server: {
      cors: {
        origin: ['https://api.toolhub.app', 'https://build.toolhub.app'],
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type']
      },
      allowedHosts: ['toolhub.app'] //added this
    }
  }
})
