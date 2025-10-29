import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',  // Écouter sur toutes les interfaces
    port: 5173,
    strictPort: true
  },
  // ✅ Important : Ne pas proxy le WebSocket vers le serveur
  // Laisser Socket.IO gérer sa propre connexion
})