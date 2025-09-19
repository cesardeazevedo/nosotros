import { type QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, createRoute, createRouter, redirect } from '@tanstack/react-router'
import { useMemo } from 'react'
import { z } from 'zod'
import { selectedPubkeyAtom } from './atoms/auth.atoms'
import { decksAtom } from './atoms/deck.atoms'
import { addRecentAtom } from './atoms/recent.atoms'
import { store } from './atoms/store'
import { RootLayout } from './components/elements/Layouts/RootLayout'
import { ArticlesRoute } from './components/modules/Articles/ArticlesRoute'
import { DeckRoute } from './components/modules/Deck/DeckRoute'
import { EditorRoute } from './components/modules/Editor/EditorRoute'
import { Feed } from './components/modules/Feed/Feed'
import { FeedHeader } from './components/modules/Feed/FeedHeader'
import { FeedHeadline } from './components/modules/Feed/FeedHeadline'
import { FeedRoute } from './components/modules/Feed/FeedRoute'
import { FeedHeaderBase } from './components/modules/Feed/headers/FeedHeaderBase'
import { HomeRoute } from './components/modules/Home/HomeRoute'
import { FollowSetList } from './components/modules/Lists/FollowSets/FollowSetList'
import { ListsRoute } from './components/modules/Lists/ListRoute'
import { RelaySetList } from './components/modules/Lists/RelaySets/RelaySetList'
import { StarterPackList } from './components/modules/Lists/StarterPacks/StarterPackList'
import { MediaRoute } from './components/modules/Media/MediaRoute'
import { NostrEventPending } from './components/modules/NostrEvent/NostrEventLoading'
import { NostrEventRoute } from './components/modules/NostrEvent/NostrEventRoute'
import { NotificationRoute } from './components/modules/Notifications/NotificationRoute'
import { NProfileLoading } from './components/modules/NProfile/NProfileLoading'
import { NProfileRoute } from './components/modules/NProfile/NProfileRoute'
import { RelayActiveRoute } from './components/modules/RelayActive/RelayActiveRoute'
import { RelayMonitorRoute } from './components/modules/RelayMonitor/RelayMonitorRoute'
import { RelayRoute } from './components/modules/Relays/RelaysRoute'
import { SearchRoute } from './components/modules/Search/SearchRoute'
import { SettingsAboutRoute } from './components/modules/Settings/SettingsAbout'
import { SettingsMediaStorage } from './components/modules/Settings/SettingsMediaStorage'
import { SettingsPreferencesRoute } from './components/modules/Settings/SettingsPreferenceRoute'
import { SettingsRelayAuth } from './components/modules/Settings/SettingsRelaysAuth'
import { SettingsRoute } from './components/modules/Settings/SettingsRoute'
import { SettingsStorageRoute } from './components/modules/Settings/SettingsStorage'
import { TagHeader } from './components/modules/Tag/TagHeader'
import { Kind } from './constants/kinds'
import type { NostrFilter } from './core/types'
import { ErrorBoundary } from './ErrorBoundary'
import { loadThreads } from './hooks/loaders/loadThreads'
import { createProfileModule } from './hooks/modules/createProfileFeedModule'
import { createTagFeedModule } from './hooks/modules/createTagFeedModule'
import { queryClient } from './hooks/query/queryClient'
import { queryKeys } from './hooks/query/queryKeys'
import type { FeedModule, FeedScope } from './hooks/query/useQueryFeeds'
import { useFeedState } from './hooks/state/useFeed'
import type { NostrContext } from './nostr/context'
import { READ, WRITE } from './nostr/types'
import { decodeNIP19 } from './utils/nip19'

type RouteContext = {
  queryClient: QueryClient
}

const rootRoute = createRootRouteWithContext<RouteContext>()({
  component: RootLayout,
  errorComponent: ErrorBoundary,
  validateSearch: z.object({
    zap: z.string().optional(),
    n: z.string().optional(),
    media: z.number().optional(),
    invoice: z.string().optional(),
    sign_in: z.boolean().optional(),
    compose_kind: z.number().optional(),
    pubkey: z.string().optional(),
    compose: z.boolean().optional(),
    quoting: z.string().optional(),
    replying: z.string().optional(),
  }),
})

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomeRoute,
})

export const homeRepliesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/threads',
  component: () => <HomeRoute replies />,
})

const zNumberArray = z.union([z.number(), z.array(z.number())]).optional()
const zStringArray = z.union([z.string(), z.array(z.string())]).optional()

export const feedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/feed',
  validateSearch: z.object({
    pubkey: z.string().optional(),
    permission: z
      .preprocess(
        (value) => {
          switch (value) {
            case 1: {
              return 'read'
            }
            case 2: {
              return 'write'
            }
            case 3: {
              return 'readwrite'
            }
            default: {
              return value
            }
          }
        },
        z.enum(['read', 'write', 'readwrite']),
      )
      .optional(),
    relay: zStringArray,
    relaySets: zStringArray,
    outbox: z.boolean().optional(),

    // nostr filters
    kind: zNumberArray.default(1),
    author: z.union([z.string(), z.array(z.string())]).optional(),
    limit: z.number().optional(),
    search: z.string().optional(),
    until: z.number().optional(),
    since: z.number().optional(),
    a: zStringArray,
    A: zStringArray,
    e: zStringArray,
    q: zStringArray,
    E: zStringArray,
    k: zStringArray,
    K: zStringArray,
    p: zStringArray,
    t: zStringArray,
    d: zStringArray,

    // feed filters
    live: z.boolean().optional(),
    scope: z
      .union([
        z.literal('self'),
        z.literal('following'),
        z.literal('sets_p'),
        z.literal('sets_e'),
        z.literal('relayfeed'),
        z.literal('inbox'),
      ])
      .optional(),
    blured: z.boolean().optional(),
    includeReplies: z.boolean().optional(),

    type: z
      .enum([
        'home',
        'feed',
        'media',
        'quotes',
        'reposts',
        'search',
        'tags',
        'lists',
        'articles',
        'relaysets',
        'relayfeed',
        'followset',
        'starterpack',
        'notifications',
      ])
      .optional(),
  }),
  loaderDeps: ({ search }) => ({
    // context
    relay: search.relay,
    relaySets: search.relaySets,
    pubkey: search.pubkey,
    permission: search.permission,
    outbox: search.outbox,

    // nostr filters
    kind: search.kind,
    author: search.author,
    limit: search.limit,
    search: search.search,
    until: search.until,
    since: search.since,
    e: search.e,
    E: search.E,
    q: search.q,
    a: search.a,
    A: search.A,
    k: search.k,
    K: search.K,
    p: search.p,
    t: search.t,
    d: search.d,

    // feed filters
    live: search.live,
    scope: search.scope,
    blured: search.blured,
    includeReplies: search.includeReplies,
    type: search.type,
  }),
  loader: (options) => {
    const { deps } = options
    const {
      kind,
      author,
      limit = 50,
      search,
      until,
      since,
      live = true,
      scope = 'self',
      type = 'feed',
      blured,
      relay,
      relaySets,
      outbox = true,
      pubkey,
      permission,
      includeReplies = false,
    } = deps

    const filter = {} as NostrFilter
    if (kind) {
      filter.kinds = [kind].flat()
    }
    if (author) {
      filter.authors = [author].flat()
    }
    if (limit) {
      filter.limit = limit
    }
    if (search) {
      filter.search = search
    }
    if (until) {
      filter.until = until
    }
    if (since) {
      filter.since = since
    }
    if (deps.e) {
      filter['#e'] = [deps.e].flat()
    }
    if (deps.E) {
      filter['#E'] = [deps.E].flat()
    }
    if (deps.q) {
      filter['#q'] = [deps.q].flat()
    }
    if (deps.a) {
      filter['#a'] = [deps.a].flat()
    }
    if (deps.A) {
      filter['#A'] = [deps.A].flat()
    }
    if (deps.p) {
      filter['#p'] = [deps.p].flat()
    }
    if (deps.t) {
      filter['#t'] = [deps.t].flat()
    }
    if (deps.d) {
      filter['#d'] = [deps.d].flat()
    }
    if (deps.k) {
      filter['#k'] = [deps.k].flat()
    }
    if (deps.K) {
      filter['#K'] = [deps.K].flat()
    }

    const ctx: NostrContext = {}
    if (relay) {
      ctx.relays = [relay].flat()
      ctx.network = 'REMOTE_ONLY'
      // We don't want negentropy for relay feeds
      ctx.negentropy = false
    }
    if (relaySets) {
      ctx.relaySets = [relaySets].flat()
    }
    if (outbox) {
      ctx.outbox = true
    }
    if (pubkey) {
      ctx.pubkey = pubkey
    }
    if (permission) {
      ctx.permission =
        permission === 'read'
          ? READ
          : permission === 'write'
            ? WRITE
            : permission === 'readwrite'
              ? READ | WRITE
              : undefined
    }
    const id = 'custom_' + JSON.stringify(filter)
    return {
      id,
      type,
      live,
      includeReplies,
      filter,
      blured,
      scope: scope as FeedScope,
      queryKey: queryKeys.feed(id, filter, ctx),
      ctx,
    } as FeedModule
  },
  component: () => {
    const module = feedRoute.useLoaderData()
    const feed = useFeedState(module)
    return <FeedRoute feed={feed} headline={<FeedHeadline feed={feed} />} header={<FeedHeader feed={feed} />} />
  },
})

export const deckRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/deck/$id',
  beforeLoad: (options) => {
    const { id } = options.params
    const decks = store.get(decksAtom)
    if (!(id in decks)) {
      throw redirect({ to: '/deck/$id', params: { id: 'default' } })
    }
  },
  component: DeckRoute,
})

export const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  preload: true,
  gcTime: Infinity,
  staleTime: Infinity,
  preloadStaleTime: Infinity,
  preloadGcTime: Infinity,
  beforeLoad: () => {
    const pubkey = store.get(selectedPubkeyAtom)
    if (!pubkey) {
      throw redirect({ to: '/', search: { sign_in: true }, replace: true })
    }
    return { pubkey }
  },
  component: NotificationRoute,
})

export const mediaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/media',
  component: MediaRoute,
})

export const articleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/articles',
  component: ArticlesRoute,
})

export const composeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/compose',
  component: () => <EditorRoute />,
})

export const nostrRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '$nostr',
  beforeLoad: (options) => {
    const decoded = decodeNIP19(options.params.nostr)
    return { decoded }
  },
  loader: async (options) => {
    const { nostr } = options.params
    const { decoded, queryClient } = options.context
    switch (decoded?.type) {
      case 'npub': {
        break
      }
      case 'nprofile': {
        break
      }
      case 'note': {
        await loadThreads(queryClient, nostr)
        break
      }
      case 'nevent': {
        await loadThreads(queryClient, nostr)
        break
      }
      case 'naddr': {
        await loadThreads(queryClient, nostr)
        break
      }
      default: {
        break
      }
    }
  },
  onEnter(options) {
    const { decoded } = options.context
    switch (decoded?.type) {
      case 'npub': {
        store.set(addRecentAtom, { id: decoded.data, type: 'profile' })
        break
      }
      case 'nprofile': {
        store.set(addRecentAtom, { id: decoded.data.pubkey, type: 'profile' })
        break
      }
    }
  },
  pendingComponent: () => {
    const { decoded } = nostrRoute.useRouteContext()
    switch (decoded?.type) {
      case 'npub': {
        return <NProfileLoading pubkey={decoded.data} />
      }
      case 'nprofile': {
        return <NProfileLoading pubkey={decoded.data.pubkey} />
      }
      default: {
        return <NostrEventPending />
      }
    }
  },
  component: function NostrRoute() {
    const { decoded } = nostrRoute.useRouteContext()
    const { nostr } = nostrRoute.useParams()
    switch (decoded?.type) {
      case 'npub':
        return <NProfileRoute pubkey={decoded.data} />
      case 'nprofile': {
        return <NProfileRoute pubkey={decoded.data.pubkey} />
      }
      case 'note':
      case 'nevent':
      case 'naddr': {
        return <NostrEventRoute nip19={nostr} />
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
  component: function NProfileIndexRoute() {
    const { nostr } = nprofileIndexRoute.useParams()
    const module = useMemo(() => createProfileModule({ nip19: nostr, includeReplies: false }), [nostr])
    const feed = useFeedState(module)
    return <Feed feed={feed} />
  },
})

const nprofileRepliesRoute = createRoute({
  getParentRoute: () => nostrRoute,
  path: '/replies',
  component: function NProfileReplieRoute() {
    const { nostr } = nprofileRepliesRoute.useParams()
    const module = useMemo(() => createProfileModule({ nip19: nostr, includeReplies: true }), [nostr])
    const feed = useFeedState(module)
    return <Feed feed={feed} />
  },
})

const nprofileMediaRoute = createRoute({
  getParentRoute: () => nostrRoute,
  path: 'media',
  component: function NProfileMediaRoute() {
    const { nostr } = nprofileMediaRoute.useParams()
    const module = useMemo(() => createProfileModule({ nip19: nostr, filter: { kinds: [Kind.Media] } }), [nostr])
    const feed = useFeedState(module)
    return <Feed feed={feed} />
  },
})

const nprofileArticlesRoute = createRoute({
  getParentRoute: () => nostrRoute,
  path: 'articles',
  component: function NProfileArticleRoute() {
    const { nostr } = nprofileArticlesRoute.useParams()
    const module = useMemo(() => createProfileModule({ nip19: nostr, filter: { kinds: [Kind.Article] } }), [nostr])
    const feed = useFeedState(module)
    return <Feed feed={feed} />
  },
})

const tagsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tag/$tag',
  component: function () {
    const params = tagsRoute.useParams()
    const module = useMemo(() => createTagFeedModule(params.tag), [params.tag])
    const feed = useFeedState(module)
    return (
      <FeedRoute
        feed={feed}
        header={<FeedHeaderBase feed={feed} renderRelaySettings leading={<TagHeader feed={feed} />} />}
      />
    )
  },
})

export const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  validateSearch: z.object({ q: z.string().optional() }),
  loaderDeps: ({ search: { q } }) => ({ q }),
  beforeLoad: (x) => {
    if (!x.search.q) {
      throw redirect({ to: '/', replace: true })
    }
  },
  component: SearchRoute,
})

const listsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lists',
  component: ListsRoute,
})

const starterPackRoute = createRoute({
  getParentRoute: () => listsRoute,
  path: '/',
  component: StarterPackList,
})

const followSetsRoute = createRoute({
  getParentRoute: () => listsRoute,
  path: '/followsets',
  component: FollowSetList,
})

const relaySetsRoute = createRoute({
  getParentRoute: () => listsRoute,
  path: '/relaysets',
  component: RelaySetList,
})

const relaysRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/relays',
  component: RelayRoute,
})

const relayActiveRoute = createRoute({
  getParentRoute: () => relaysRoute,
  path: '/',
  component: RelayActiveRoute,
})

const relayMonitorRoute = createRoute({
  getParentRoute: () => relaysRoute,
  path: '/monitor',
  component: RelayMonitorRoute,
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

const settingsRelaysAuthRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/relay_auth',
  component: SettingsRelayAuth,
})

const settingsMediaStorage = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/media',
  component: SettingsMediaStorage,
})

const settingsStorageRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/storage',
  component: SettingsStorageRoute,
})

const settingsAboutRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/about',
  component: SettingsAboutRoute,
})

export const routeTree = rootRoute.addChildren([
  homeRoute,
  homeRepliesRoute,
  feedRoute,
  nostrRoute.addChildren([nprofileIndexRoute, nprofileRepliesRoute, nprofileMediaRoute, nprofileArticlesRoute]),
  deckRoute,
  tagsRoute,
  searchRoute,
  listsRoute.addChildren([starterPackRoute, followSetsRoute, relaySetsRoute]),
  notificationsRoute,
  mediaRoute,
  articleRoute,
  composeRoute,
  relaysRoute.addChildren([relayActiveRoute, relayMonitorRoute]),
  settingsRoute.addChildren([
    settingsPreferenceRoute,
    settingsRelaysAuthRoute,
    settingsMediaStorage,
    settingsStorageRoute,
    settingsAboutRoute,
  ]),
])

export const router = createRouter({
  routeTree,
  defaultStaleTime: 300000,
  defaultPreload: false,
  defaultPendingMinMs: 0,
  scrollRestoration: false,
  defaultPendingMs: 0,
  context: {
    queryClient,
  },
})

window.history.scrollRestoration = 'auto'

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
