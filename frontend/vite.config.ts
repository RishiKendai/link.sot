import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  server: {
    port: 5173,
    proxy: {
      '/proxy': {
        target: 'http://localhost:5673',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy/, '/api/v1'),
      },
    }
  }
})
