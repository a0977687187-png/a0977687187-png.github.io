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
        // 主站的 service worker 範圍涵蓋整個網域，會把 /yuzu-local/（朋友的本機版）
        // 的導覽也攔截成主站頁面，必須排除，兩個 App 才能在同一支手機共存。
        navigateFallbackDenylist: [/^\/yuzu-local\//],
      },
    }),
  ],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
})
