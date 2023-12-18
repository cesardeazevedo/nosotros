import { RootRoute, Route, Router, RouterProvider, redirect } from '@tanstack/react-router'
import GlobalStyles from 'components/elements/Layouts/GlobalStyles'
import RootLayout from 'components/elements/Layouts/RootLayout'
import HomeRoute from 'components/routes/home.route'
import NEventRoute from 'components/routes/nevent.route'
import NProfileRoute from 'components/routes/nprofile.route'
import { Prefixes, decodeNIP19, isNevent, isNote, isNprofile, isNpub } from 'utils/nip19'

const rootRoute = new RootRoute({
  component: RootLayout,
})

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomeRoute,
})

const signinRoute = new Route({
  getParentRoute: () => indexRoute,
  path: '/sign_in',
})

export const replyRoute = new Route({
  getParentRoute: () => indexRoute,
  path: '/$nostr/replies',
})

export const nostrRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '$nostr',
  parseParams: (params) => ({ nostr: params.nostr as `${keyof Prefixes}1${string}` }),
  beforeLoad: (context) => {
    const decoded = decodeNIP19(context.params.nostr)
    // Normalized all decoded that so we can easily access the id in the components
    switch (true) {
      case isNpub(decoded):
      case isNote(decoded):
        return { decoded, id: decoded.data }
      case isNprofile(decoded):
        return { decoded, id: decoded.data.pubkey, pubkey: decoded.data.pubkey, relays: decoded.data.relays }
      case isNevent(decoded):
        return { decoded, id: decoded.data.id, pubkey: decoded.data.author, relays: decoded.data.relays }
      default:
        return {}
    }
  },
  component: function NostrRoute(props) {
    const context = props.useRouteContext()
    const { decoded, id, relays } = context
    if (decoded) {
      switch (true) {
        case isNpub(decoded):
        case isNprofile(decoded):
          return <NProfileRoute pubkey={id} relays={relays} />
        case isNote(decoded):
        case isNevent(decoded):
          return <NEventRoute id={id} relays={relays} />
        default:
          redirect({ to: '/' })
      }
    }
    redirect({ to: '/' })
  },
})

const routeTree = rootRoute.addChildren([indexRoute, nostrRoute, signinRoute, replyRoute])

const router = new Router({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  return (
    <>
      <GlobalStyles />
      <RouterProvider router={router} />
    </>
  )
}

export default App
