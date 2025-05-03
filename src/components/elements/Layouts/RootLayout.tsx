import { useAppVisibility } from '@/hooks/useAppVisibility'
import { useMobile } from '@/hooks/useMobile'
import { useNostrSync } from '@/hooks/useNostrSync'
import { useOnline } from '@/hooks/useOnline'
import { useRelayAuthenticator } from '@/hooks/useRelayAuthenticator'
import { useCurrentPubkey } from '@/hooks/useRootStore'
import { Outlet } from '@tanstack/react-router'
import { Dialogs } from 'components/modules/DialogsModule'
import { Header } from '../Header/Header'
import { BottomNavigation } from '../Navigation/BottomNavigation'
import { SidebarLayout } from '../Sidebar/SidebarLayout'
import { Toaster } from './Toaster'

export const RootLayout = () => {
  const isMobile = useMobile()
  const pubkey = useCurrentPubkey()
  useNostrSync(pubkey)
  useRelayAuthenticator()
  useOnline()
  useAppVisibility()

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
}
