import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'Vintage Cars of Lagos Admin',
        short_name: 'VCOL Admin',
        description: 'Admin dashboard for Vintage Cars of Lagos',
        theme_color: '#0a0a0a',
        background_color: '#C9A84C',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  server: {
    port: 3002,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
    },
  },
})
