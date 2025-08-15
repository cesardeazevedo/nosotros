import { NotificationBadge } from '@/components/modules/Notifications/NotificationBadge'
import { Divider } from '@/components/ui/Divider/Divider'
import { Fab } from '@/components/ui/Fab/Fab'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useNprofile } from '@/hooks/useEventUtils'
import { useMobile } from '@/hooks/useMobile'
import { shape } from '@/themes/shape.stylex'
import {
  IconBell,
  IconBellFilled,
  IconListDetails,
  IconNews,
  IconPhoto,
  IconSettings,
  IconSettingsFilled,
  IconUser,
} from '@tabler/icons-react'
import { Link, useMatchRoute } from '@tanstack/react-router'
import { memo, useContext } from 'react'
import { css, html } from 'react-strict-dom'
import { SidebarContext } from './SidebarContext'
import { SidebarMenuDecks } from './SidebarMenuDecks'
import { SidebarMenuFeeds } from './SidebarMenuFeeds'
import { SidebarMenuLogout } from './SidebarMenuLogout'
import { SidebarMenuRecents } from './SidebarMenuRecents'
import { SidebarMenuRelays } from './SidebarMenuRelays'

const iconProps = {
  size: 24,
  strokeWidth: '1.8',
}

export const SidebarMenu = memo(function SidebarMenu() {
  const pubkey = useCurrentPubkey()
  const nprofile = useNprofile(pubkey)
  const match = useMatchRoute()
  const isMobile = useMobile()
  const context = useContext(SidebarContext)

  const isNotification = context.pane === '/notifications' || !!match({ to: '/notifications' })

  return (
    <Stack horizontal={false} sx={styles.root} gap={1}>
      <Stack horizontal={false} gap={0.5} sx={styles.wrapper}>
        <SidebarMenuFeeds />
        <MenuItem
          interactive
          selected={isNotification}
          leadingIcon={
            <NotificationBadge>
              {isNotification ? <IconBellFilled {...iconProps} /> : <IconBell {...iconProps} />}
            </NotificationBadge>
          }
          onClick={() => context.setPane('/notifications')}
          label={'Notifications'}
          trailingIcon
        />
        <Link to='/media'>
          {({ isActive }) => (
            <MenuItem
              interactive
              label='Media'
              selected={isActive}
              leadingIcon={<IconPhoto {...iconProps} />}
              onClick={() => context.setPane(false)}
            />
          )}
        </Link>
        <Link to='/articles'>
          {({ isActive }) => (
            <MenuItem
              interactive
              selected={isActive}
              leadingIcon={<IconNews {...iconProps} />}
              label='Articles'
              onClick={() => context.setPane(false)}
            />
          )}
        </Link>
        <MenuItem
          interactive
          selected={context.pane === '/lists'}
          onClick={() => context.setPane('/lists')}
          leadingIcon={<IconListDetails {...iconProps} />}
          label='Lists'
        />
        <Link
          to={`/$nostr`}
          params={{
            nostr: nprofile || '',
          }}>
          {({ isActive }) => (
            <MenuItem
              interactive
              selected={isActive}
              leadingIcon={<IconUser {...iconProps} />}
              label='Profile'
              onClick={() => context.setPane(false)}
            />
          )}
        </Link>
      </Stack>
      {!isMobile && (
        <>
          <Divider />
          <html.div style={styles.wrapper}>
            <SidebarMenuDecks expanded />
          </html.div>
        </>
      )}
      <Divider />
      <html.div style={styles.wrapper}>
        <SidebarMenuRecents />
      </html.div>
      {/* {root.recents.list.length !== 0 && <Divider />} */}
      <html.div style={styles.wrapper}>
        <SidebarMenuRelays />
        <Link to='/settings'>
          {({ isActive }) => (
            <MenuItem
              interactive
              selected={isActive}
              leadingIcon={isActive ? <IconSettingsFilled {...iconProps} /> : <IconSettings {...iconProps} />}
              label='Settings'
              onClick={() => context.setPane(false)}
            />
          )}
        </Link>
        <br />
        <Link to='.' search={{ compose: true }}>
          <Fab size='lg' variant='primary' label='Create note' fullWidth />
        </Link>
        <br />
        <br />
        {isMobile && (
          <>
            <SidebarMenuLogout />
          </>
        )}
      </html.div>
    </Stack>
  )
})

const styles = css.create({
  root: {
    width: '100%',
    borderRadius: shape.lg,
    backgroundColor: 'transparent',
  },
  wrapper: {
    width: '100%',
    paddingInline: 12,
  },
})
