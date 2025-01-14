import { HomeRoute } from '@/components/routes/home/home.route'
import { NEventRoute } from '@/components/routes/nevent/nevent.route'
import { NProfileRoute } from '@/components/routes/nprofile/nprofile.route'
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
  useRouteContext,
} from '@tanstack/react-router'
import { ErrorBoundary } from 'ErrorBoundary'
import { RootLayout } from 'components/elements/Layouts/RootLayout'
import { DeckRoute } from 'components/routes/deck.route'
import { decodeNIP19 } from 'utils/nip19'
import { NProfileArticlesFeed } from './components/modules/NProfile/feeds/NProfileArticlesFeed'
import { NProfileMediaFeed } from './components/modules/NProfile/feeds/NProfileMediaFeed'
import { NProfileNotesFeed } from './components/modules/NProfile/feeds/NProfileNotesFeed'
import { NProfileRepliesFeed } from './components/modules/NProfile/feeds/NProfileRepliesFeed'
import { homeLoader, welcomeLoader } from './components/routes/home/home.loader'
import { HomePending } from './components/routes/home/home.pending'
import { neventLoader } from './components/routes/nevent/nevent.loader'
import { notificationLoader } from './components/routes/notification/notification.loader'
import { NotificationsRoute } from './components/routes/notification/notifications.route'
import { nprofileFeedLoader, nprofileLoader } from './components/routes/nprofile/nprofile.loader'
import { RelayRoute } from './components/routes/relays.route'
import { SettingsContentRoute } from './components/routes/settings/settings.content'
import { SettingsDisplayRoute } from './components/routes/settings/settings.display'
import { SettingsNetworkRoute } from './components/routes/settings/settings.network'
import { SettingsRoute } from './components/routes/settings/settings.route'
import { SettingsStorageRoute } from './components/routes/settings/settings.storage'
import { rootStore } from './stores/root.store'

const rootRoute = createRootRouteWithContext()({
  component: RootLayout,
  errorComponent: ErrorBoundary,
})

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  pendingMinMs: 700,
  staleTime: 500000,
  loader: (options) => {
    const { pubkey } = rootStore.auth
    if (pubkey) {
      return homeLoader(pubkey, options.abortController.signal)
    } else {
      return welcomeLoader(options.abortController.signal)
    }
  },
  component: () => <HomeRoute />,
  pendingComponent: () => <HomePending />,
})

export const deckRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/deck',
  component: () => <DeckRoute />,
})

export const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  pendingMinMs: 0,
  staleTime: 500000,
  beforeLoad: () => {
    const { pubkey } = rootStore.auth
    if (!pubkey) {
      throw redirect({ to: '/', search: { sign_in: true } })
    }
    return { pubkey }
  },
  loader: (options) => notificationLoader({ pubkey: options.context.pubkey }),
  component: () => <NotificationsRoute />,
  // Notifications need to be sorted
  pendingMs: 600,
})

export const nostrRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '$nostr',
  staleTime: 500000,
  pendingMs: 1000,
  parseParams: (params) => ({ nostr: params.nostr }),
  beforeLoad: (options) => {
    const decoded = decodeNIP19(options.params.nostr)
    // Normalized all decoded that so we can easily access the id in the components
    switch (decoded?.type) {
      case 'npub': {
        return { decoded, id: decoded.data }
      }
      case 'nprofile': {
        const pubkey = decoded.data.pubkey
        const relays = decoded.data.relays
        return { decoded, id: decoded.data.pubkey, pubkey, relays }
      }
      case 'note': {
        return { decoded, id: decoded.data }
      }
      case 'nevent': {
        const id = decoded.data.id
        const pubkey = decoded.data.author
        const relays = decoded.data.relays
        return { decoded, id, pubkey, relays }
      }
      default: {
        return {}
      }
    }
  },
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
      default:
        return {}
    }
  },
  component: function NostrRoute() {
    const context = useRouteContext({ from: '/$nostr' })
    const { decoded, id, relays } = context
    if (decoded) {
      switch (decoded?.type) {
        case 'npub':
        case 'nprofile':
          return <NProfileRoute pubkey={id} relays={relays} />
        case 'note':
        case 'nevent':
          return <NEventRoute />
        default:
          redirect({ to: '/' })
      }
    }
    redirect({ to: '/' })
  },
  errorComponent: ErrorBoundary,
})

const nprofileIndexRoute = createRoute({
  getParentRoute: () => nostrRoute,
  path: '/',
  loader: (options) => nprofileFeedLoader(options),
  component: function NProfileIndexRoute() {
    const module = nprofileIndexRoute.useLoaderData()
    return <NProfileNotesFeed window module={module} />
  },
})

const nprofileRepliesRoute = createRoute({
  getParentRoute: () => nostrRoute,
  path: 'replies',
  loader: async (options) => nprofileFeedLoader(options),
  component: function NProfileReplieRoute() {
    const module = nprofileRepliesRoute.useLoaderData()
    return <NProfileRepliesFeed window module={module} />
  },
})

const nprofileMediaRoute = createRoute({
  getParentRoute: () => nostrRoute,
  path: 'media',
  loader: async (options) => nprofileFeedLoader(options),
  component: function NProfilePhotosRoute() {
    const module = nprofileMediaRoute.useLoaderData()
    return <NProfileMediaFeed window module={module} />
  },
})

const nprofileArticlesRoute = createRoute({
  getParentRoute: () => nostrRoute,
  path: 'articles',
  loader: async (options) => nprofileFeedLoader(options),
  component: function NProfileArticleRoute() {
    const module = nprofileArticlesRoute.useLoaderData()
    return <NProfileArticlesFeed window module={module} />
  },
})

export const replyRoute = createRoute({
  getParentRoute: () => homeRoute,
  path: '/replies/$nevent',
})
export const replyRoute2 = createRoute({
  getParentRoute: () => nostrRoute,
  path: '/replies/$nevent',
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

const settingsContentRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/content',
  component: SettingsContentRoute,
})

const settingsStorageRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/storage',
  component: SettingsStorageRoute,
})

export const routeTree = rootRoute.addChildren([
  homeRoute.addChildren([replyRoute]),
  nostrRoute.addChildren([
    replyRoute2,
    // nprofile tabs
    nprofileIndexRoute,
    nprofileRepliesRoute,
    nprofileMediaRoute,
    nprofileArticlesRoute,
  ]),
  deckRoute,
  notificationsRoute,
  relaysRoute,
  settingsRoute.addChildren([settingsDisplayRoute, settingsNetworkRoute, settingsContentRoute, settingsStorageRoute]),
])

export const router = createRouter({
  routeTree,
  defaultPreload: false,
  defaultPendingMinMs: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
