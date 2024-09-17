import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { IconLayoutSidebarLeftExpand, IconLayoutSidebarRightExpand } from '@tabler/icons-react'
import { useCurrentRoute } from 'hooks/useNavigations'
import LinkRouter from '../Links/LinkRouter'
import RelaysPopover from '../Relays/RelayPopover'
import SettingsPopover from '../Settings/SettingsPopover'
import HeaderSignIn from './HeaderSignIn'

function HeaderActions() {
  const router = useCurrentRoute()
  return (
    <Stack gap={1}>
      <Tooltip text='Deck mode' enterDelay={0}>
        <>
          {router.routeId !== '/deck' && (
            <LinkRouter to='/deck'>
              <IconButton icon={<IconLayoutSidebarLeftExpand strokeWidth='1.5' />} />
            </LinkRouter>
          )}
          {router.routeId === '/deck' && (
            <LinkRouter to='/'>
              <IconButton icon={<IconLayoutSidebarRightExpand strokeWidth='1.5' />} />
            </LinkRouter>
          )}
        </>
      </Tooltip>
      <RelaysPopover />
      <SettingsPopover />
      <HeaderSignIn />
    </Stack>
  )
}

export default HeaderActions
