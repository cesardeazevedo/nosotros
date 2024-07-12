import { Box, IconButton, } from '@mui/material'
import { IconLayoutSidebarLeftExpand, IconLayoutSidebarRightExpand } from '@tabler/icons-react'
import { useCurrentRoute } from 'hooks/useNavigations'
import { authStore } from 'stores/ui/auth.store'
import ThemeButton from '../Buttons/ThemeButton'
import Tooltip from '../Layouts/Tooltip'
import LinkRouter from '../Links/LinkRouter'
import NotificationPopover from '../Notification/NotificationPopover'
import RelaysPopover from '../Relays/RelayPopover'
import HeaderSignIn from './HeaderSignIn'

function HeaderActions() {
  const router = useCurrentRoute()
  return (
    <>
      <Tooltip title='Deck mode' enterDelay={0}>
        <>
          {router.routeId !== '/deck' && (
            <LinkRouter to='/deck'>
              <IconButton color='inherit' sx={{ mr: 1 }} >
                <IconLayoutSidebarLeftExpand strokeWidth='1.5' />
              </IconButton>
            </LinkRouter>
          )}
          {router.routeId === '/deck' && (
            <LinkRouter to='/'>
              <IconButton color='inherit' sx={{ mr: 1 }} >
                <IconLayoutSidebarRightExpand strokeWidth='1.5' />
              </IconButton>
            </LinkRouter>
          )}
        </>
      </Tooltip>
      <RelaysPopover />
      <ThemeButton />
      {authStore.pubkey && (
        <Box sx={[{ mx: 1, ['@media (max-width: 1040px)']: { display: 'none' } }]}>
          <NotificationPopover />
        </Box>
      )}
      <Box sx={{ mx: 1 }} />
      <HeaderSignIn />
    </>
  )
}

export default HeaderActions
