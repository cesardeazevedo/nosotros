import { NostrRouteParallel } from '@/components/modules/Nostr/NostrRouteParallel'
import { RouteUtilsContextProvider } from '@/components/providers/RouteUtilsProvider'
import { useMobile } from '@/hooks/useMobile'
import { useRelayAuthenticator } from '@/hooks/useRelayAuthenticator'
import { Outlet, useSearch } from '@tanstack/react-router'
import { lazy, memo, Suspense } from 'react'
import { css, html } from 'react-strict-dom'
import { Header } from '../Header/Header'
import { BottomNavigation } from '../Navigation/BottomNavigation'
import { SidebarLayout } from '../Sidebar/SidebarLayout'
import { Toaster } from './Toaster'

// This components simulates parallel routing with the nostr route.
// So we don't have to unmount the feed when navigating to a nostr link.
// Making page transitions way much faster.
const OutletParallel = () => {
  const nostr = useSearch({ from: '__root__', select: (x) => x.nostr })

  return (
    <>
      <html.div style={[styles.outlet, !!nostr && styles.hidden]}>
        <RouteUtilsContextProvider value={{ hiddenRoute: !!nostr }}>
          <Outlet />
        </RouteUtilsContextProvider>
      </html.div>
      {!!nostr && <NostrRouteParallel nostr={nostr} />}
    </>
  )
}

const Dialogs = lazy(async () => import('components/modules/DialogsModule').then((m) => ({ default: m.Dialogs })))

export const RootLayout = memo(function RootLayout() {
  const isMobile = useMobile()
  useRelayAuthenticator()

  return (
    <>
      <Suspense fallback={null}>
        <Dialogs />
      </Suspense>
      {!isMobile && (
        <SidebarLayout>
          <OutletParallel />
        </SidebarLayout>
      )}
      {isMobile && (
        <Header>
          <OutletParallel />
        </Header>
      )}
      <BottomNavigation />
      <Toaster />
    </>
  )
})

const styles = css.create({
  outlet: {
    height: 'inherit',
  },
  hidden: {
    display: 'none',
  },
})
