import { Box, useTheme } from '@mui/material'
import { Outlet } from '@tanstack/react-router'
import BottomNavigation from 'components/elements/Navigation/BottomNavigation'
import Dialogs from 'components/modules/DialogsModule'
import { Toaster } from 'sonner'
import Header from '../Header/Header'

function RootLayout() {
  const theme = useTheme()
  return (
    <>
      <Dialogs />
      <Header />
      <Toaster theme={theme.palette.mode} visibleToasts={10} closeButton />
      <Box sx={(theme) => ({ height: '100%', mt: 8, [theme.breakpoints.down('sm')]: { mt: 7 } })}>
        <Outlet />
        <BottomNavigation />
      </Box>
    </>
  )
}

export default RootLayout
