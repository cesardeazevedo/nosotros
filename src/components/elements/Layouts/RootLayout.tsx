import { useMobile } from '@/hooks/useMobile'
import { useNostrSync } from '@/hooks/useNostrSync'
import { useCurrentPubkey } from '@/hooks/useRootStore'
import { Outlet } from '@tanstack/react-router'
import { Dialogs } from 'components/modules/DialogsModule'
import { Header } from '../Header/Header'
import { BottomNavigation } from '../Navigation/BottomNavigation'
import { SidebarLayout } from '../Sidebar/SidebarLayout'
import { SignInButtonFab } from '../SignIn/SignInButtonFab'
import { Toaster } from './Toaster'

export const RootLayout = () => {
  const isMobile = useMobile()
  const pubkey = useCurrentPubkey()
  useNostrSync(pubkey)
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
      {!pubkey ? <SignInButtonFab /> : null}
      <Toaster />
    </>
  )
}
