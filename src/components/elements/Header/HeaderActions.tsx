import { Box, IconButton } from '@mui/material'
import { IconLayoutSidebarLeftExpand, IconLayoutSidebarRightExpand } from '@tabler/icons-react'
import { useCurrentRoute } from 'hooks/useNavigations'
import Tooltip from '../Layouts/Tooltip'
import LinkRouter from '../Links/LinkRouter'
import RelaysPopover from '../Relays/RelayPopover'
import SettingsPopover from '../Settings/SettingsPopover'
import HeaderSignIn from './HeaderSignIn'

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
      <RelaysPopover />
      <SettingsPopover />
      <Box sx={{ mx: 1 }} />
      <HeaderSignIn />
    </>
  )
}

export default HeaderActions
