/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
// eslint-disable-next-line import/order
import path from 'path'
import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import { VitePWA } from 'vite-plugin-pwa'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    https: true,
    port: 8000,
  },
  define: {
    'process.env.APP_NAME': JSON.stringify('Nosotros'),
    'process.env.BUGSNAG_API_KEY': JSON.stringify('4dc625765598a98e69c5215ce6e75062'),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: ['**/node_modules/**', '**/e2e/**'],
    browser: {
      name: 'chrome',
    },
    setupFiles: ['fake-indexeddb/auto', path.join(__dirname, `/jest.setup.ts`)],
  },
  plugins: [
    VitePWA({
      srcDir: 'src',
      devOptions: {
        enabled: false,
      },
      filename: 'serviceWorker.ts',
      strategies: 'injectManifest',
      manifest: {
        name: 'Nosotros',
        short_name: 'Nosotros',
        description: 'A decentralized social network based on nostr protocol',
        icons: [
          {
            src: '/apple-touch-icon-72x72.png',
            type: 'image/png',
            sizes: '72x72',
          },
          {
            src: '/apple-touch-icon-96x96.png',
            type: 'image/png',
            sizes: '96x96',
          },
          {
            src: '/apple-touch-icon-128x128.png',
            type: 'image/png',
            sizes: '128x128',
          },
          {
            src: '/apple-touch-icon-144x144.png',
            type: 'image/png',
            sizes: '144x144',
          },
          {
            src: '/apple-touch-icon-152x152.png',
            type: 'image/png',
            sizes: '152x152',
          },
          {
            src: '/apple-touch-icon-180x180.png',
            type: 'image/png',
            sizes: '180x180',
          },
          {
            src: '/apple-touch-icon-192x192.png',
            type: 'image/png',
            sizes: '192x192',
          },
          {
            src: '/apple-touch-icon-512x512.png',
            type: 'image/png',
            sizes: '512x512',
          },
        ],
        start_url: '/',
        background_color: '#000',
        display: 'standalone',
        scope: '/',
        theme_color: '#000',
      },
      workbox: {
        globDirectory: 'public/',
        globPatterns: ['**/*.{html,js,css,png,jpg,jpeg,svg,webp}'],
      },
    }),
    mkcert(),
    tsconfigPaths(),
    react(),
  ],
})
