import { useCurrentPubkey } from '@/hooks/useAuth'
import { useMobile } from '@/hooks/useMobile'
import { useRelayAuthenticator } from '@/hooks/useRelayAuthenticator'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Outlet, useRouteContext, useRouter } from '@tanstack/react-router'
import { Dialogs } from 'components/modules/DialogsModule'
import { memo } from 'react'
import { Header } from '../Header/Header'
import { BottomNavigation } from '../Navigation/BottomNavigation'
import { SidebarLayout } from '../Sidebar/SidebarLayout'
import { Toaster } from './Toaster'

export const RootLayout = memo(function RootLayout() {
  const isMobile = useMobile()
  const context = useRouteContext({ from: '__root__' })
  useRelayAuthenticator()

  return (
    <>
      <Dialogs />
      {!isMobile && (
        <SidebarLayout>
          <Outlet />
        </SidebarLayout>
      )}
      {isMobile && (
        <Header>
          <Outlet />
        </Header>
      )}
      <BottomNavigation />
      <Toaster />
      {import.meta.env.DEV && (
        <div style={{ fontSize: '125%' }}>
          <ReactQueryDevtools client={context.queryClient} />
        </div>
      )}
      {/* <TanStackRouterDevtools router={router} /> */}
    </>
  )
})
