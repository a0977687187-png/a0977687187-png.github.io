import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // manifest.webmanifest 由 public/ 自行維護（含中文 name/icons），這裡只負責產生
    // service worker，把打包後的資源全部預先快取，讓 App 離線也能開啟（開發說明書 6.1）。
    VitePWA({
      manifest: false,
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
      },
    }),
  ],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
})
