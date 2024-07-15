import { createRootRouteWithContext, createRoute, createRouter, redirect, useRouteContext } from '@tanstack/react-router'
import ErrorBoundary from 'ErrorBoundary'
import RootLayout from 'components/elements/Layouts/RootLayout'
import DeckRoute from 'components/routes/deck.route'
import HomeRoute, { loadHome } from 'components/routes/home.route'
import NEventRoute, { loadNote } from 'components/routes/nevent.route'
import NProfileRoute, { loadProfile } from 'components/routes/nprofile.route'
import { decodeNIP19, isNevent, isNote, isNprofile, isNpub, type Prefixes } from 'utils/nip19'

interface RouterContext { }

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  errorComponent: ErrorBoundary,
})

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  loader: () => loadHome(),
  component: () => (
    <HomeRoute />
  ),
})


export const deckRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/deck',
  component: () => <DeckRoute />
})

const signinRoute = createRoute({
  getParentRoute: () => homeRoute,
  path: '/sign_in',
})

export const replyRoute = createRoute({
  getParentRoute: () => homeRoute,
  path: '/$nostr/replies',
})

export const nostrRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '$nostr',
  parseParams: (params) => ({ nostr: params.nostr as `${keyof Prefixes}1${string}` }),
  beforeLoad: (options) => {
    const decoded = decodeNIP19(options.params.nostr)
    // Normalized all decoded that so we can easily access the id in the components
    switch (true) {
      case isNpub(decoded): {
        return { decoded, id: decoded.data }
      }
      case isNprofile(decoded): {
        const pubkey = decoded.data.pubkey
        const relays = decoded.data.relays
        return { decoded, id: decoded.data.pubkey, pubkey, relays }
      }
      case isNote(decoded): {
        return { decoded, id: decoded.data }
      }
      case isNevent(decoded): {
        const id = decoded.data.id
        const pubkey = decoded.data.author
        const relays = decoded.data.relays
        return { decoded, id, pubkey, relays }
      }
      default:
        return {}
    }
  },
  loader: (options) => {
    console.log(options)
    const { decoded } = options.context
    switch (true) {
      case isNpub(decoded): {
        return loadProfile({ pubkey: decoded.data })
      }
      case isNprofile(decoded): {
        return loadProfile(decoded.data)
      }
      case isNote(decoded): {
        return loadNote({ id: decoded.data })
      }
      case isNevent(decoded): {
        return loadNote(decoded.data)
      }
      default:
        return {}
    }
  },
  component: function NostrRoute() {
    const context = useRouteContext({ from: '/$nostr' })
    const { decoded, id, relays } = context
    if (decoded) {
      switch (true) {
        case isNpub(decoded):
        case isNprofile(decoded):
          return <NProfileRoute pubkey={id} relays={relays} />
        case isNote(decoded):
        case isNevent(decoded):
          return <NEventRoute />
        default:
          redirect({ to: '/' })
      }
    }
    redirect({ to: '/' })
  },
  errorComponent: ErrorBoundary,
})

export const routeTree = rootRoute.addChildren([homeRoute, deckRoute, nostrRoute, signinRoute, replyRoute])


export const router = createRouter({
  routeTree,
  defaultPreload: false,
  defaultPendingMinMs: 300,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export type RouterTypeof = typeof router
