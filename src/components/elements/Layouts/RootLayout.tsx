import { Box } from '@mui/material'
import BottomNavigation from 'components/elements/Navigation/BottomNavigation'
import Dialogs from 'components/modules/dialogs'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import Header from '../Header/Header'

function RootLayout() {
  return (
    <>
      <Dialogs />
      <Header />
      <ScrollRestoration />
      <Box sx={(theme) => ({ height: '100%', mt: 8, [theme.breakpoints.down('sm')]: { mt: 7 } })}>
        <Outlet />
        <BottomNavigation />
      </Box>
    </>
  )
}

export default RootLayout
