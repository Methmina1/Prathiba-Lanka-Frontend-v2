import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // VITE_BASE_PATH is only set by the Pages deployment job (app served from /<repo>/).
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react()],
  server: {
    port: 5173,
    // The backend already allows http://localhost:5173 in its CORS config.
    open: false,
  },
  preview: {
    port: 4173,
  },
})
