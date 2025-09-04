import { NotificationBadge } from '@/components/modules/Notifications/NotificationBadge'
import { Divider } from '@/components/ui/Divider/Divider'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useCurrentPubkey, useCurrentUser } from '@/hooks/useAuth'
import { useNprofile } from '@/hooks/useEventUtils'
import { useMobile } from '@/hooks/useMobile'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import {
  IconArticle,
  IconArticleFilled,
  IconBell,
  IconBellFilled,
  IconListDetails,
  IconPhoto,
  IconPhotoFilled,
  IconSettings,
  IconSettingsFilled,
  IconUser,
} from '@tabler/icons-react'
import { Link, useMatchRoute } from '@tanstack/react-router'
import { memo, useContext } from 'react'
import { css, html } from 'react-strict-dom'
import { JoinNostrButton } from '../Buttons/JoinNostrButton'
import { IconHome } from '../Icons/IconHome'
import { IconHomeFilled } from '../Icons/IconHomeFilled'
import { SidebarContext } from './SidebarContext'
import { SidebarMenuDecks } from './SidebarMenuDecks'
import { SidebarMenuLogout } from './SidebarMenuLogout'
import { SidebarMenuRecents } from './SidebarMenuRecents'
import { SidebarMenuRelays } from './SidebarMenuRelays'
import { SidebarRelayFavorites } from './SidebarRelayFavorites'

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

  const user = useCurrentUser()
  const isNotification = context.pane === '/notifications' || !!match({ to: '/notifications' })

  return (
    <Stack horizontal={false} sx={styles.root} gap={1}>
      <Stack horizontal={false} gap={0.5} sx={styles.wrapper}>
        {!pubkey && (
          <>
            <JoinNostrButton />
            <br />
          </>
        )}
        {pubkey && (
          <Link tabIndex={-1} to='/'>
            {({ isActive }) => (
              <MenuItem
                selected={isActive}
                onClick={() => context.setPane(false)}
                leadingIcon={isActive ? <IconHomeFilled {...iconProps} /> : <IconHome {...iconProps} />}
                label={
                  <>
                    Following{' '}
                    {user?.totalFollowing ? <Text size='md' sx={styles.gray}>{`(${user.totalFollowing})`}</Text> : ''}
                  </>
                }
              />
            )}
          </Link>
        )}
        {pubkey && (
          <MenuItem
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
        )}
        <Link to='/media'>
          {({ isActive }) => (
            <MenuItem
              label='Media'
              selected={isActive}
              leadingIcon={isActive ? <IconPhotoFilled {...iconProps} /> : <IconPhoto {...iconProps} />}
              onClick={() => context.setPane(false)}
            />
          )}
        </Link>
        <Link to='/articles'>
          {({ isActive }) => (
            <MenuItem
              selected={isActive}
              leadingIcon={isActive ? <IconArticleFilled {...iconProps} /> : <IconArticle {...iconProps} />}
              label='Articles'
              onClick={() => context.setPane(false)}
            />
          )}
        </Link>
        <MenuItem
          selected={context.pane === '/lists'}
          onClick={() => context.setPane('/lists')}
          leadingIcon={<IconListDetails {...iconProps} />}
          label='Lists'
        />
        {pubkey && (
          <Link
            to={`/$nostr`}
            params={{
              nostr: nprofile || '',
            }}>
            {({ isActive }) => (
              <MenuItem
                selected={isActive}
                leadingIcon={<IconUser {...iconProps} />}
                label='Profile'
                onClick={() => context.setPane(false)}
              />
            )}
          </Link>
        )}
      </Stack>
      <Divider />
      <Stack horizontal={false} sx={styles.wrapper}>
        <SidebarRelayFavorites />
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
      <Stack horizontal={false} gap={0.5} sx={styles.wrapper}>
        <SidebarMenuRelays />
        <Link to='/settings'>
          {({ isActive }) => (
            <MenuItem
              selected={isActive}
              leadingIcon={isActive ? <IconSettingsFilled {...iconProps} /> : <IconSettings {...iconProps} />}
              label='Settings'
              onClick={() => context.setPane(false)}
            />
          )}
        </Link>
        <br />
        {isMobile && <SidebarMenuLogout />}
      </Stack>
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
  gray: {
    color: palette.onSurfaceVariant,
    fontWeight: 500,
  },
})
