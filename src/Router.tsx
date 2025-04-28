import { createRootRouteWithContext, createRoute, createRouter, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { RootLayout } from './components/elements/Layouts/RootLayout'
import { RouteContainer } from './components/elements/Layouts/RouteContainer'
import { RouteHeader } from './components/elements/Layouts/RouteHeader'
import { RelayListRowLoading } from './components/elements/Relays/RelayListRowLoading'
import { RelayTableRowLoading } from './components/elements/Relays/RelayTableRowLoading'
import { ArticlesPending } from './components/modules/Articles/ArticlesPending'
import { ArticlesRoute } from './components/modules/Articles/ArticlesRoute'
import { DeckRoute } from './components/modules/Deck/DeckRoute'
import { EditorRoute } from './components/modules/Editor/EditorRoute'
import { Feed } from './components/modules/Feed/Feed'
import { FeedHeader } from './components/modules/Feed/FeedHeader'
import { FeedHeadline } from './components/modules/Feed/FeedHeadline'
import { FeedPending } from './components/modules/Feed/FeedPending'
import { FeedRoute } from './components/modules/Feed/FeedRoute'
import { FeedHeaderBase } from './components/modules/Feed/headers/FeedHeaderBase'
import { HomePending } from './components/modules/Home/HomePending'
import { HomeRoute } from './components/modules/Home/HomeRoute'
import { FollowSetRoute } from './components/modules/Lists/FollowSets/FollowSetRoute'
import { ListsPending } from './components/modules/Lists/ListPending'
import { ListsRoute } from './components/modules/Lists/ListRoute'
import { RelaySetsRoute } from './components/modules/Lists/RelaySets/RelaySetRoute'
import { MediaPending } from './components/modules/Media/MediaPending'
import { MediaRoute } from './components/modules/Media/MediaRoute'
import { NostrEventPending } from './components/modules/NostrEvent/NostrEventLoading'
import { NostrEventRoute } from './components/modules/NostrEvent/NostrEventRoute'
import { NotificationPending } from './components/modules/Notifications/NotificationPending'
import { NotificationRoute } from './components/modules/Notifications/NotificationRoute'
import { NProfileLoading } from './components/modules/NProfile/NProfileLoading'
import { NProfileRoute } from './components/modules/NProfile/NProfileRoute'
import { RelayActiveRoute } from './components/modules/RelayActive/RelayActiveRoute'
import { RelayDiscoveryHeader } from './components/modules/RelayDiscovery/RelayDiscoveryHeader'
import { RelayDiscoveryList } from './components/modules/RelayDiscovery/RelayDiscoveryList'
import { RelayDiscoveryTable } from './components/modules/RelayDiscovery/RelayDiscoveryTable'
import { RelayRoute } from './components/modules/Relays/RelaysRoute'
import { SearchHeader } from './components/modules/Search/SearchHeader'
import { SearchSettings } from './components/modules/Search/SearchSettings'
import { SettingsPreferencesRoute } from './components/modules/Settings/SettingsPreferenceRoute'
import { SettingsRoute } from './components/modules/Settings/SettingsRoute'
import { SettingsStorageRoute } from './components/modules/Settings/SettingsStorageRoute'
import { TagHeader } from './components/modules/Tag/TagHeader'
import { Kind } from './constants/kinds'
import type { NostrFilter } from './core/types'
import { ErrorBoundary } from './ErrorBoundary'
import { useMobile } from './hooks/useMobile'
import { useResetScroll } from './hooks/useResetScroll'
import type { NostrContext } from './nostr/context'
import { subscribeSync } from './nostr/subscriptions/subscribeSync'
import { READ, WRITE } from './nostr/types'
import { FeedScope } from './stores/feeds/feed.store'
import {
  createArticleModule,
  createFeedModule,
  createHomeModule,
  createMediaModule,
  createNAddressModule,
  createNEventModule,
  createNoteModule,
  createNotificationModule,
  createNProfileModule,
  createRelayDiscoveryModule,
  createSearchModule,
  createTagModule,
} from './stores/modules/module.helpers'
import type { NProfileModule } from './stores/modules/nprofile.module'
import { NProfileModuleModel } from './stores/modules/nprofile.module'
import { rootStore, type RootStore } from './stores/root.store'
import { subscribeDeckColums } from './stores/subscriptions/subscribeDeckColumns'
import { startFeedStream, subscribeFeedStore } from './stores/subscriptions/subscribeFeedStore'
import { subscribeLists } from './stores/subscriptions/subscribeLists'
import { subscribeNostrModule } from './stores/subscriptions/subscribeNostrModule'
import { subscribeRelayDiscoveryModule } from './stores/subscriptions/subscribeRelayDiscoveryModule'
import { decodeNIP19 } from './utils/nip19'

const rootRoute = createRootRouteWithContext<{ rootStore: RootStore }>()({
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
  loader: (options) => {
    const { pubkey } = options.context.rootStore.auth
    const module = createHomeModule(pubkey)
    startFeedStream(module).subscribe()
    return module
  },
  pendingComponent: HomePending,
  component: HomeRoute,
})

const zNumberArray = z.union([z.number(), z.array(z.number())]).optional()
const zStringArray = z.union([z.string(), z.array(z.string())]).optional()

export const feedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/feed',
  validateSearch: z.object({
    // context
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
    scope: z
      .union([
        z.literal('self'),
        z.literal('following'),
        z.literal('followset'),
        z.literal('relaysets'),
        z.literal('relayfeed'),
        z.literal('inbox'),
      ])
      .optional(),
    blured: z.boolean().optional(),

    includeRoot: z.boolean().optional(),
    includeParents: z.boolean().optional(),
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
        'articles',
        'relaysets',
        'relayfeed',
        'followset',
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
    scope: search.scope,
    blured: search.blured,
    includeRoot: search.includeRoot,
    includeReplies: search.includeReplies,
    includeParents: search.includeParents,
    type: search.type,
  }),
  loader: (options) => {
    const { deps } = options
    const {
      kind,
      author,
      limit,
      search,
      until,
      since,
      scope,
      type = 'feed',
      blured,
      relay,
      relaySets,
      outbox = true,
      pubkey,
      permission,
      includeRoot = true,
      includeReplies = true,
      includeParents = false,
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

    const context: NostrContext = { batcher: 'eager' }
    if (relay) {
      context.relays = [relay].flat()
    }
    if (relaySets) {
      context.relaySets = [relaySets].flat()
    }
    if (outbox) {
      context.outbox = true
    }
    if (pubkey) {
      context.pubkey = pubkey
    }
    if (permission) {
      context.permission =
        permission === 'read'
          ? READ
          : permission === 'write'
            ? WRITE
            : permission === 'readwrite'
              ? READ | WRITE
              : undefined
    }
    const module = createFeedModule({
      type,
      feed: {
        scope: FeedScope.is(scope) ? scope : 'self',
        filter,
        blured,
        context,
        options: {
          includeRoot,
          includeReplies,
          includeParents,
        },
      },
    })
    subscribeFeedStore(module.feed).subscribe()
    return module
  },
  pendingComponent: () => {
    return <FeedPending />
  },
  component: () => {
    const module = feedRoute.useLoaderData()
    return (
      <FeedRoute module={module} headline={<FeedHeadline module={module} />} header={<FeedHeader module={module} />} />
    )
  },
})

export const deckRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/deck/$id',
  beforeLoad: (options) => {
    const { id } = options.params
    const { decks } = options.context.rootStore
    decks.select(id)
  },
  loader: (options) => {
    const { id } = options.params
    const { decks } = options.context.rootStore
    const deck = decks.decks.get(id)
    if (deck) {
      subscribeDeckColums(deck).subscribe()
    }
  },
  pendingComponent: DeckRoute,
  component: DeckRoute,
})

export const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  preload: true,
  beforeLoad: (options) => {
    const { pubkey } = options.context.rootStore.auth
    if (!pubkey) {
      throw redirect({ to: '/', search: { sign_in: true }, replace: true })
    }
    return { pubkey }
  },
  loader: (options) => {
    const { pubkey } = options.context
    const module = createNotificationModule(pubkey)
    subscribeFeedStore(module.feed, { buffer: 1500 }).subscribe()
    return module
  },
  pendingComponent: NotificationPending,
  component: NotificationRoute,
})

export const mediaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/media',
  loader: (options) => {
    const { pubkey } = options.context.rootStore.auth
    const module = createMediaModule(pubkey)
    subscribeFeedStore(module.feed).subscribe()
    return { module }
  },
  pendingComponent: MediaPending,
  component: MediaRoute,
})

export const articleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/articles',
  loader: (options) => {
    const { pubkey } = options.context.rootStore.auth
    const module = createArticleModule(pubkey)
    subscribeFeedStore(module.feed).subscribe()
    return { module }
  },
  pendingComponent: ArticlesPending,
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
  loader: (options) => {
    const { decoded, rootStore } = options.context
    let module
    switch (decoded?.type) {
      case 'npub': {
        module = createNProfileModule(decoded.data)
        subscribeSync(decoded.data, [Kind.Metadata, Kind.Follows], rootStore.globalContext).subscribe()
        break
      }
      case 'nprofile': {
        module = createNProfileModule(decoded.data.pubkey, decoded.data.relays)
        subscribeSync(decoded.data.pubkey, [Kind.Metadata, Kind.Follows], rootStore.globalContext).subscribe()
        break
      }
      case 'nevent': {
        module = createNEventModule(decoded.data)
        subscribeNostrModule(module).subscribe()
        break
      }
      case 'note': {
        module = createNoteModule(decoded.data)
        subscribeNostrModule(module).subscribe()
        break
      }
      case 'naddr': {
        module = createNAddressModule(decoded.data)
        subscribeNostrModule(module).subscribe()
        break
      }
      default: {
        break
      }
    }
    return { module }
  },
  onEnter(options) {
    const { decoded, rootStore } = options.context
    switch (decoded?.type) {
      case 'npub': {
        rootStore.recents.add(decoded.data, 'profile')
        break
      }
      case 'nprofile': {
        rootStore.recents.add(decoded.data.pubkey, 'profile')
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
    useResetScroll()
    switch (decoded?.type) {
      case 'npub':
        return <NProfileRoute pubkey={decoded.data} />
      case 'nprofile': {
        return <NProfileRoute pubkey={decoded.data.pubkey} />
      }
      case 'note': {
        return <NostrEventRoute id={decoded.data} />
      }
      case 'nevent': {
        return <NostrEventRoute id={decoded.data.id} />
      }
      case 'naddr': {
        return <NostrEventRoute id={[decoded.data.kind, decoded.data.pubkey, decoded.data.identifier].join(':')} />
      }
      default: {
        return null
      }
    }
  },
  errorComponent: ErrorBoundary,
})

const getNProfileModule = async (options: { parentMatchPromise: Promise<{ loaderData?: { module: unknown } }> }) => {
  return (await options.parentMatchPromise).loaderData?.module as NProfileModule
}

const nprofileIndexRoute = createRoute({
  getParentRoute: () => nostrRoute,
  path: '/',
  loader: async (options) => {
    const module = await getNProfileModule(options)
    subscribeFeedStore(module.feeds.notes).subscribe()
  },
  component: function NProfileIndexRoute() {
    const { module } = nostrRoute.useLoaderData()
    if (NProfileModuleModel.is(module)) {
      return <Feed feed={module.feeds.notes} />
    }
  },
})

const nprofileRepliesRoute = createRoute({
  getParentRoute: () => nostrRoute,
  path: 'replies',
  loader: async (options) => {
    const module = await getNProfileModule(options)
    subscribeFeedStore(module.feeds.replies).subscribe()
  },
  component: function NProfileReplieRoute() {
    const { module } = nostrRoute.useLoaderData()
    if (NProfileModuleModel.is(module)) {
      return <Feed feed={module.feeds.replies} />
    }
  },
})

const nprofileMediaRoute = createRoute({
  getParentRoute: () => nostrRoute,
  path: 'media',
  loader: async (options) => {
    const module = await getNProfileModule(options)
    subscribeFeedStore(module.feeds.media).subscribe()
  },
  component: function NProfileMediaRoute() {
    const { module } = nostrRoute.useLoaderData()
    if (NProfileModuleModel.is(module)) {
      return <Feed feed={module.feeds.media} />
    }
  },
})

const nprofileArticlesRoute = createRoute({
  getParentRoute: () => nostrRoute,
  path: 'articles',
  loader: async (options) => {
    const module = await getNProfileModule(options)
    subscribeFeedStore(module.feeds.articles).subscribe()
  },
  component: function NProfileArticleRoute() {
    const { module } = nostrRoute.useLoaderData()
    if (NProfileModuleModel.is(module)) {
      return <Feed feed={module.feeds.articles} />
    }
  },
})

const tagsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tag/$tag',
  loader: (options) => {
    const { tag } = options.params
    const module = createTagModule(tag)
    subscribeFeedStore(module.feed).subscribe()
    return module
  },
  pendingComponent: () => {
    const { tag } = tagsRoute.useParams()
    return <FeedPending header={<FeedHeaderBase leading={<TagHeader tags={[tag]} />} />} />
  },
  component: function() {
    const module = tagsRoute.useLoaderData()
    useResetScroll()
    return (
      <FeedRoute
        module={module}
        header={<FeedHeaderBase feed={module.feed} renderRelaySettings leading={<TagHeader module={module} />} />}
      />
    )
  },
})

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  validateSearch: z.object({ q: z.string() }),
  loaderDeps: ({ search: { q } }) => ({ q }),
  loader: (options) => {
    const { q: query = '' } = options.deps
    const module = createSearchModule(query)
    subscribeFeedStore(module.feed).subscribe()
    return { module, query }
  },
  pendingComponent: () => {
    return <FeedPending header={<SearchHeader />} />
  },
  component: function SearchRoute() {
    const { module } = searchRoute.useLoaderData()
    return <FeedRoute module={module} header={<SearchSettings module={module} />} />
  },
})

const listsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lists',
  loader: () => subscribeLists().subscribe(),
  pendingComponent: ListsPending,
  component: ListsRoute,
})

const followSetsRoute = createRoute({
  getParentRoute: () => listsRoute,
  path: '/',
  component: FollowSetRoute,
})

const relaySetsRoute = createRoute({
  getParentRoute: () => listsRoute,
  path: '/relaysets',
  loader: () => subscribeLists().subscribe(),
  pendingComponent: ListsPending,
  component: RelaySetsRoute,
})

const relaysRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/relays',
  component: RelayRoute,
})

const relayActiveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/relays/active',
  component: RelayActiveRoute,
})

const relayDiscoveryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/explore/relays',
  loader: () => {
    const module = createRelayDiscoveryModule()
    subscribeRelayDiscoveryModule(module).subscribe()
    return module
  },
  pendingComponent: function() {
    const isMobile = useMobile()
    return (
      <RouteContainer maxWidth='lg' header={<RouteHeader label='Relay Discovery' />}>
        {isMobile ? <RelayListRowLoading /> : <RelayTableRowLoading />}
      </RouteContainer>
    )
  },
  component: function() {
    const module = relayDiscoveryRoute.useLoaderData()
    const isMobile = useMobile()
    useResetScroll()
    return (
      <RouteContainer maxWidth='lg' header={<RelayDiscoveryHeader module={module} />}>
        {isMobile ? <RelayDiscoveryList module={module} /> : <RelayDiscoveryTable module={module} />}
      </RouteContainer>
    )
  },
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
  feedRoute,
  nostrRoute.addChildren([nprofileIndexRoute, nprofileRepliesRoute, nprofileMediaRoute, nprofileArticlesRoute]),
  deckRoute,
  tagsRoute,
  searchRoute,
  listsRoute.addChildren([followSetsRoute, relaySetsRoute]),
  notificationsRoute,
  mediaRoute,
  articleRoute,
  composeRoute,
  relaysRoute,
  relayActiveRoute,
  relayDiscoveryRoute,
  settingsRoute.addChildren([settingsPreferenceRoute, settingsStorageRoute]),
])

export const router = createRouter({
  routeTree,
  defaultStaleTime: 300000,
  defaultGcTime: 300000,
  defaultPreload: false,
  defaultPendingMinMs: 0,
  scrollRestoration: false,
  context: {
    rootStore,
  },
})

window.history.scrollRestoration = 'auto'

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
