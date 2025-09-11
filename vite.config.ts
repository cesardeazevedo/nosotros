/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import Info from 'unplugin-info/vite'
import type { PluginOption } from 'vite'
import { defineConfig } from 'vite'
// import circleDependency from 'vite-plugin-circular-dependency'
import { join, resolve } from 'node:path'
import { visualizer } from 'rollup-plugin-visualizer'
import mkcert from 'vite-plugin-mkcert'
import { VitePWA } from 'vite-plugin-pwa'
import styleX from 'vite-plugin-stylex'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isTesting = mode === 'testing'
  return {
    server: {
      host: true,
      port: 8000,
      hmr: false,
    },
    optimizeDeps: {
      exclude: ['@sqlite.org/sqlite-wasm'],
    },
    build: {
      sourcemap: true,
    },
    define: {
      global: {},
    },
    test: {
      globals: true,
      watch: false,
      testTimeout: 10000,
      reporters: ['verbose'],
      environment: 'jsdom',
      exclude: ['**/node_modules/**', '**/e2e/**'],
      setupFiles: ['@vitest/web-worker', 'fake-indexeddb/auto', join(__dirname, `/jest.setup.ts`)],
      server: {
        deps: {
          inline: ['react-tweet'],
        },
      },
    },
    plugins: [
      // circleDependency({ outputFilePath: './circleDep' }),
      !isTesting ? mkcert({}) : null,
      tsconfigPaths(),
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler', { target: '19' }]],
        },
      }),
      styleX({
        importSources: [
          {
            from: 'react-strict-dom',
            as: 'css',
          },
        ],
        aliases: {
          '@/*': [join(__dirname, './src', '*')],
        },
      }),
      Info(),
      visualizer() as PluginOption,
      VitePWA({
        strategies: 'generateSW',
        registerType: 'autoUpdate',
        injectRegister: false,
        manifest: {
          name: 'Nosotros',
          short_name: 'Nosotros',
          description: 'A decentralized social network based on nostr protocol',
          background_color: '#000',
          theme_color: '#000',
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
        },
        devOptions: {
          enabled: false,
        },
        workbox: {
          sourcemap: true,
          maximumFileSizeToCacheInBytes: 2800000,
          globPatterns: ['**/*.{js,css,svg,ico}'],
          globIgnores: [
            'assets/clarity-*.js', // this file from shiki is crashing for some reason
            'assets/*worker*.js',
            'assets/sqlite3-opfs*.js',
          ],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/imgproxy\.nosotros\.app\/_\/user_avatar\/plain\/.+/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'dynamic-images',
                expiration: {
                  maxEntries: 1000,
                  maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
  }
})
