import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
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
