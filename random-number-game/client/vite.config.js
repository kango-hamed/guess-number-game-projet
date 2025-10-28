import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0', // ✅ Écouter sur toutes les interfaces
    port: 5173,
    strictPort: true,
    // Autoriser les connexions externes
    cors: true,
    // Configuration du proxy si nécessaire
    proxy: {}
  }
})