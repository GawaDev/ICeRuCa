import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { APP_BACKGROUND_COLOR, APP_DESCRIPTION, APP_NAME, APP_THEME_COLOR } from './src/appIdentity.js'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg', 'favicon.png', 'apple-touch-icon.png', 'pwa-192.png', 'pwa-512.png', 'pwa-maskable-512.png', 'og.png', 'screenshots/wide-map.png', 'screenshots/narrow-map.png'],
      manifest: {
        id: '/',
        name: APP_NAME,
        short_name: APP_NAME,
        description: APP_DESCRIPTION,
        lang: 'ja',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui', 'browser'],
        background_color: APP_BACKGROUND_COLOR,
        theme_color: APP_THEME_COLOR,
        categories: ['travel', 'utilities'],
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        screenshots: [
          { src: 'screenshots/wide-map.png', sizes: '1280x720', type: 'image/png', form_factor: 'wide', label: '地図でカードと利用エリアを確認' },
          { src: 'screenshots/narrow-map.png', sizes: '390x844', type: 'image/png', form_factor: 'narrow', label: 'スマートフォンの地図画面' },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/health/, /^\/robots\.txt/, /^\/sitemap\.xml/, /^\/llms\.txt/, /^\/\.well-known\//],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,geojson,webmanifest}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 650,
  },
})
