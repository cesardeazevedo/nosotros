import { Box, IconButton } from '@mui/material'
import { IconLayoutSidebarLeftExpand, IconLayoutSidebarRightExpand } from '@tabler/icons-react'
import { useCurrentRoute } from 'hooks/useNavigations'
import { authStore } from 'stores/ui/auth.store'
import ThemeButton from '../Buttons/ThemeButton'
import Tooltip from '../Layouts/Tooltip'
import LinkRouter from '../Links/LinkRouter'
import RelaysPopover from '../Relays/RelayPopover'
import HeaderSignIn from './HeaderSignIn'
import SettingsPopover from '../Settings/SettingsPopover'

function HeaderActions() {
  const router = useCurrentRoute()
  return (
    <>
      <Tooltip title='Deck mode' enterDelay={0}>
        <>
          {router.routeId !== '/deck' && (
            <LinkRouter to='/deck'>
              <IconButton color='inherit' sx={{ m: 0.5 }}>
                <IconLayoutSidebarLeftExpand strokeWidth='1.5' />
              </IconButton>
            </LinkRouter>
          )}
          {router.routeId === '/deck' && (
            <LinkRouter to='/'>
              <IconButton color='inherit' sx={{ m: 0.5 }}>
                <IconLayoutSidebarRightExpand strokeWidth='1.5' />
              </IconButton>
            </LinkRouter>
          )}
        </>
      </Tooltip>
      <ThemeButton />
      <RelaysPopover />
      <SettingsPopover />
      {/* {authStore.pubkey && ( */}
      {/*   <Box sx={[{ mx: 0, ['@media (max-width: 1040px)']: { display: 'none' } }]}></Box> */}
      {/* )} */}
      <Box sx={{ mx: 1 }} />
      <HeaderSignIn />
    </>
  )
}

export default HeaderActions
