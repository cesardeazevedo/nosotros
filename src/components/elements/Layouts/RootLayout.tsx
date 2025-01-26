import { Outlet } from '@tanstack/react-router'
import { Dialogs } from 'components/modules/DialogsModule'
import { Stats } from '../Footer/Stats'
import { Header } from '../Header/Header'
import { BottomNavigation } from '../Navigation/BottomNavigation'
import { Toaster } from './Toaster'

export const RootLayout = () => {
  return (
    <>
      <Dialogs />
      <Header>
        <Outlet />
      </Header>
      <BottomNavigation />
      <Toaster />
      <Stats />
    </>
  )
}
