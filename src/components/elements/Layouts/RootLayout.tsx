import { Outlet } from '@tanstack/react-router'
import Dialogs from 'components/modules/DialogsModule'
import Stats from '../Footer/Stats'
import Header from '../Header/Header'
import { Toaster } from './Toaster'
import BottomNavigation from '../Navigation/BottomNavigation'

function RootLayout() {
  return (
    <>
      <Dialogs />
      <Header />
      <Outlet />
      <BottomNavigation />
      <Toaster />
      <Stats />
    </>
  )
}

export default RootLayout
