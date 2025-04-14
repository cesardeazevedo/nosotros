import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  useNavigate,
  useRouteContext,
  useSearch,
} from '@tanstack/react-router'
import { useEffect } from 'react'
import { z } from 'zod'
import { RootLayout } from './components/elements/Layouts/RootLayout'
import { DeckRoute } from './components/modules/Deck/DeckRoute'
import { EditorRoute } from './components/modules/Editor/EditorRoute'
import { HomeRoute } from './components/modules/Home/HomeRoute'
import { MediaRoute } from './components/modules/Media/MediaRoute'
import { naddressLoader } from './components/modules/NAddress/naddress.loader'
import { NAddressRoute } from './components/modules/NAddress/NAddressRoute'
import { neventLoader } from './components/modules/NEvent/nevent.loader'
import { NEventPending } from './components/modules/NEvent/NEventLoading'
import { NEventRoute } from './components/modules/NEvent/NEventRoute'
import { NotificationsRoute } from './components/modules/Notifications/notifications.route'
import { NProfileArticlesFeed } from './components/modules/NProfile/feeds/NProfileArticlesFeed'
import { NProfileMediaFeed } from './components/modules/NProfile/feeds/NProfileMediaFeed'
import { NProfileNotesFeed } from './components/modules/NProfile/feeds/NProfileNotesFeed'
import { NProfileRepliesFeed } from './components/modules/NProfile/feeds/NProfileRepliesFeed'
import { nprofileFeedLoader, nprofileLoader } from './components/modules/NProfile/nprofile.loader'
import { NProfileLoading } from './components/modules/NProfile/NProfileLoading'
import { NProfileRoute } from './components/modules/NProfile/NProfileRoute'
import { RelayFeedRoute } from './components/modules/RelayFeed/RelayFeedRoute'
import { RelayRoute } from './components/modules/Relays/RelaysRoute'
import { SearchRoute } from './components/modules/Search/SearchRoute'
import { SettingsContentRoute } from './components/modules/Settings/SettingsContentRoute'
import { SettingsDisplayRoute } from './components/modules/Settings/SettingsDisplayRoute'
import { SettingsMediaStorage } from './components/modules/Settings/SettingsMediaStorage'
import { SettingsNetworkRoute } from './components/modules/Settings/SettingsNetworkRoute'
import { SettingsRoute } from './components/modules/Settings/SettingsRoute'
import { SettingsStorageRoute } from './components/modules/Settings/SettingsStorageRoute'
import { TagsRoute } from './components/modules/Tag/TagRoute'
import { ErrorBoundary } from './ErrorBoundary'
import { useCurrentPubkey } from './hooks/useRootStore'
import { decodeNIP19 } from './utils/nip19'

const rootRoute = createRootRouteWithContext()({
  component: RootLayout,
  errorComponent: ErrorBoundary,
  validateSearch: z.object({
    zap: z.string().optional(),
    stats: z.string().optional(),
    nevent: z.string().optional(),
    invoice: z.string().optional(),
    sign_in: z.boolean().optional(),
    compose: z.boolean().optional(),
    quoting: z.string().optional(),
    replying: z.string().optional(),
  }),
})

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: z.object({ relay: z.union([z.string(), z.array(z.string()).optional()]) }),
  component: () => {
    const { relay } = useSearch({ from: homeRoute.id })
    if (relay) {
      return <RelayFeedRoute />
    }
    return <HomeRoute />
  },
})

export const deckRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/deck',
  component: () => <DeckRoute />,
})

export const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  component: function NotificationRoute() {
    const pubkey = useCurrentPubkey()
    const navigate = useNavigate()
    useEffect(() => {
      if (!pubkey) {
        navigate({ to: '/', search: { sign_in: true }, replace: true })
      }
    }, [])
    return pubkey && <NotificationsRoute pubkey={pubkey} />
  },
})

export const mediaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/media',
  component: () => <MediaRoute />,
})

export const composeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/compose',
  component: () => <EditorRoute />,
})

export const nostrRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '$nostr',
  staleTime: 500000,
  parseParams: (params) => ({ nostr: params.nostr }),
  beforeLoad: (options) => {
    const decoded = decodeNIP19(options.params.nostr)
    return { decoded }
  },
  // We need to get rid of these loaders as soon tanstack router fix their super annoying delay issues
  loader: (options) => {
    const { decoded } = options.context
    switch (decoded?.type) {
      case 'npub': {
        return nprofileLoader({ pubkey: decoded.data })
      }
      case 'nprofile': {
        return nprofileLoader(decoded.data)
      }
      case 'note': {
        return neventLoader({ id: decoded.data })
      }
      case 'nevent': {
        return neventLoader(decoded.data)
      }
      case 'naddr': {
        return naddressLoader(decoded.data)
      }
      default:
        return {}
    }
  },
  component: function NostrRoute() {
    const context = useRouteContext({ from: '/$nostr' })
    const { decoded } = context
    if (decoded) {
      switch (decoded.type) {
        case 'npub':
          return <NProfileRoute pubkey={decoded.data} />
        case 'nprofile': {
          return <NProfileRoute pubkey={decoded.data.pubkey} relays={decoded.data.relays} />
        }
        case 'note':
        case 'nevent': {
          return <NEventRoute />
        }
        case 'naddr': {
          return <NAddressRoute {...decoded.data} />
        }
        default: {
          return null
        }
      }
    }
  },
  pendingComponent: () => {
    const context = useRouteContext({ from: '/$nostr' })
    switch (context.decoded?.type) {
      case 'nevent': {
        return <NEventPending />
      }
      case 'nprofile': {
        return <NProfileLoading />
      }
      default: {
        return null
      }
    }
  },
  errorComponent: ErrorBoundary,
})

const nprofileIndexRoute = createRoute({
  getParentRoute: () => nostrRoute,
  path: '/',
  loader: (options) => {
    switch (options.context.decoded?.type) {
      case 'npub':
      case 'nprofile': {
        return nprofileFeedLoader(options, 'notes')
      }
    }
  },
  component: function NProfileIndexRoute() {
    const module = nprofileIndexRoute.useLoaderData()
    return module && <NProfileNotesFeed module={module} />
  },
})

const nprofileRepliesRoute = createRoute({
  getParentRoute: () => nostrRoute,
  path: 'replies',
  loader: (options) => nprofileFeedLoader(options, 'replies'),
  component: function NProfileReplieRoute() {
    const module = nprofileRepliesRoute.useLoaderData()
    return <NProfileRepliesFeed module={module} />
  },
})

const nprofileMediaRoute = createRoute({
  getParentRoute: () => nostrRoute,
  path: 'media',
  loader: (options) => nprofileFeedLoader(options, 'media'),
  component: function NProfileMediaRoute() {
    const module = nprofileMediaRoute.useLoaderData()
    return <NProfileMediaFeed module={module} />
  },
})

const nprofileArticlesRoute = createRoute({
  getParentRoute: () => nostrRoute,
  path: 'articles',
  loader: (options) => nprofileFeedLoader(options, 'articles'),
  component: function NProfileArticleRoute() {
    const module = nprofileArticlesRoute.useLoaderData()
    return <NProfileArticlesFeed module={module} />
  },
})

const tagsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tag/$tag',
  component: () => <TagsRoute />,
})

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  validateSearch: z.object({ q: z.string().optional() }),
  component: () => <SearchRoute />,
})

const relaysRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/relays',
  component: RelayRoute,
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsRoute,
})

const settingsDisplayRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/', // /display
  component: SettingsDisplayRoute,
})

const settingsNetworkRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/network',
  component: SettingsNetworkRoute,
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsRoute,
})

const settingsPreferenceRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/',
  component: SettingsPreferencesRoute,
})

const settingsStorageRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/storage',
  component: SettingsStorageRoute,
})

export const routeTree = rootRoute.addChildren([
  homeRoute,
  nostrRoute.addChildren([nprofileIndexRoute, nprofileRepliesRoute, nprofileMediaRoute, nprofileArticlesRoute]),
  deckRoute,
  tagsRoute,
  searchRoute,
  notificationsRoute,
  mediaRoute,
  composeRoute,
  relaysRoute,
  relayActiveRoute,
  relayDiscoveryRoute,
  settingsRoute.addChildren([settingsPreferenceRoute, settingsStorageRoute]),
])

export const router = createRouter({
  routeTree,
  defaultPreload: false,
  defaultPendingMinMs: 0,
  scrollRestoration: true,
  getScrollRestorationKey: (location) => location.pathname,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
