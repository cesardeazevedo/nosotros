import { useMobile } from '@/hooks/useMobile'
import { useRelayAuthenticator } from '@/hooks/useRelayAuthenticator'
import { Outlet } from '@tanstack/react-router'
import { Dialogs } from 'components/modules/DialogsModule'
import { memo } from 'react'
import { Header } from '../Header/Header'
import { BottomNavigation } from '../Navigation/BottomNavigation'
import { SidebarLayout } from '../Sidebar/SidebarLayout'
import { Toaster } from './Toaster'

export const RootLayout = memo(function RootLayout() {
  const isMobile = useMobile()
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
    </>
  )
})
