import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { clientsClaim } from 'workbox-core'
import { ExpirationPlugin } from 'workbox-expiration'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'

// @ts-ignore
self.skipWaiting()
clientsClaim()
cleanupOutdatedCaches()

// @ts-ignore
precacheAndRoute(self.__WB_MANIFEST)

registerRoute(
  ({ request, url }) => request.destination === 'image' && url.pathname.includes('/user_avatar'),
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 1000,
        // Cache for a maximum of a week.
        maxAgeSeconds: 7 * 24 * 60 * 60,
        // Automatically cleanup if quota is exceeded.
        purgeOnQuotaError: true,
      }),
      // Only cache images that are OK to cache.
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
)
