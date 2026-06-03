import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'PWA Town',
        short_name: 'Town',
        display: 'standalone',
        background_color: '#0b0f14',
        theme_color: '#0b0f14',
        icons: []
      },
      workbox: {
        // add glb so your tree/house/rock get precached
        globPatterns: ['**/*.{js,css,html,ico,png,svg,glb}'],
        runtimeCaching: [
          {
            urlPattern: ({url}) => url.pathname.endsWith('.ktx2') || url.pathname.endsWith('.glb'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 2592000 }
            }
          }
        ]
      }
    })
  ],
  server: { host: true },

  // --- FIX FOR VERCEL BUILD ---
  build: {
    target: 'es2022' // top-level await needs ES2022+
  },
  esbuild: {
    target: 'es2022'
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2022'
    }
  }
})