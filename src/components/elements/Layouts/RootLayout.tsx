import { useMobile } from '@/hooks/useMobile'
import { Outlet } from '@tanstack/react-router'
import { Dialogs } from 'components/modules/DialogsModule'
import { useEffect } from 'react'
import { Stats } from '../Footer/Stats'
import { Header } from '../Header/Header'
import { BottomNavigation } from '../Navigation/BottomNavigation'
import { Toaster } from './Toaster'

export const RootLayout = () => {
  const mobile = useMobile()
  useEffect(() => {
    const abortController = new AbortController()
    const clearScrollRestoration = () => {
      sessionStorage.removeItem('tsr-scroll-restoration-v1_3')
    }
    window.addEventListener('unload', clearScrollRestoration, { signal: abortController.signal })
    return () => abortController.abort()
  })
  return (
    <>
      <Dialogs />
      <Header>
        <Outlet />
      </Header>
      <BottomNavigation />
      <Toaster />
      {!mobile && <Stats />}
    </>
  )
}
