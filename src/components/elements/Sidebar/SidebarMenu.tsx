import { toggleSearchDialogAtom } from '@/atoms/dialog.atoms'
import { NotificationBadge } from '@/components/modules/Notifications/NotificationBadge'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useNprofile } from '@/hooks/useEventUtils'
import { useMobile } from '@/hooks/useMobile'
import { useSettings } from '@/hooks/useSettings'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import {
  IconBell,
  IconBellFilled,
  IconEdit,
  IconListDetails,
  IconSearch,
  IconSettings,
  IconSettingsFilled,
  IconSparkles,
  IconUser,
} from '@tabler/icons-react'
import { Link, useMatch } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { memo } from 'react'
import { css } from 'react-strict-dom'
import { JoinNostrButton } from '../Buttons/JoinNostrButton'
import { IconHome } from '../Icons/IconHome'
import { IconHomeFilled } from '../Icons/IconHomeFilled'
import { SidebarMenuLogout } from './SidebarMenuLogout'
import { SidebarMenuRelays } from './SidebarMenuRelays'

const iconProps = {
  size: 24,
  strokeWidth: '1.8',
}

export const SidebarMenu = memo(function SidebarMenu() {
  const pubkey = useCurrentPubkey()
  const nprofile = useNprofile(pubkey)
  const isMobile = useMobile()
  const { sidebarCollapsed } = useSettings()
  const toggleSearch = useSetAtom(toggleSearchDialogAtom)

  const isNotificationsRoute = !!useMatch({ from: '/notifications', shouldThrow: false })
  const isNotification = isNotificationsRoute

  return (
    <Stack horizontal={false} sx={styles.root} gap={1}>
      <Stack horizontal={false} sx={styles.wrapper}>
        {!pubkey && (
          <>
            <JoinNostrButton />
            {!isMobile && <br />}
          </>
        )}
        <Link to='.' search={{ compose: true }}>
          <SidebarTooltip collapsed={sidebarCollapsed} text='New note'>
            <MenuItem
              interactive
              collapsed={sidebarCollapsed}
              leadingIcon={<IconEdit {...iconProps} />}
              label='New note'
            />
          </SidebarTooltip>
        </Link>
        {pubkey && (
          <Link tabIndex={-1} to='/'>
            {({ isActive }) => (
              <SidebarTooltip collapsed={sidebarCollapsed} text='Following'>
                <MenuItem
                  interactive
                  collapsed={sidebarCollapsed}
                  selected={isActive}
                  leadingIcon={isActive ? <IconHomeFilled {...iconProps} /> : <IconHome {...iconProps} />}
                  label={'Feeds'}
                />
              </SidebarTooltip>
            )}
          </Link>
        )}
        {pubkey && (
          <Link to='/notifications'>
            <SidebarTooltip collapsed={sidebarCollapsed} text='Notifications'>
              <MenuItem
                interactive
                collapsed={sidebarCollapsed}
                selected={isNotification}
                leadingIcon={
                  <NotificationBadge>
                    {isNotification ? <IconBellFilled {...iconProps} /> : <IconBell {...iconProps} />}
                  </NotificationBadge>
                }
                onClick={() => { }}
                label='Notifications'
                trailingIcon
              />
            </SidebarTooltip>
          </Link>
        )}
        <SidebarTooltip collapsed={sidebarCollapsed} text='Search'>
          <MenuItem
            interactive
            collapsed={sidebarCollapsed}
            leadingIcon={<IconSearch {...iconProps} />}
            onClick={() => toggleSearch()}
            label='Search'
            trailingIcon
          />
        </SidebarTooltip>
        <Link to='/lists'>
          {({ isActive }) => (
            <SidebarTooltip collapsed={sidebarCollapsed} text='Lists'>
              <MenuItem
                interactive
                collapsed={sidebarCollapsed}
                selected={isActive}
                leadingIcon={<IconListDetails {...iconProps} />}
                label='Lists'
              />
            </SidebarTooltip>
          )}
        </Link>
        {pubkey && (
          <Link
            to={`/$nostr`}
            params={{
              nostr: nprofile || '',
            }}>
            {({ isActive }) => (
              <SidebarTooltip collapsed={sidebarCollapsed} text='Profile'>
                <MenuItem
                  interactive
                  collapsed={sidebarCollapsed}
                  selected={isActive}
                  leadingIcon={<IconUser {...iconProps} />}
                  label='Profile'
                />
              </SidebarTooltip>
            )}
          </Link>
        )}
        <SidebarMenuRelays iconProps={iconProps} />
        <Link to='/embeddings'>
          {({ isActive }) => (

            <SidebarTooltip collapsed={sidebarCollapsed} text='Embeddings (alpha)'>
              <MenuItem
                interactive
                selected={isActive}
                collapsed={sidebarCollapsed}
                leadingIcon={<IconSparkles {...iconProps} />}
                label='Embeddings (alpha)'
              />
            </SidebarTooltip>
          )}
        </Link>
        <Link to='/settings'>
          {({ isActive }) => (
            <SidebarTooltip collapsed={sidebarCollapsed} text='Settings'>
              <MenuItem
                interactive
                collapsed={sidebarCollapsed}
                selected={isActive}
                leadingIcon={isActive ? <IconSettingsFilled {...iconProps} /> : <IconSettings {...iconProps} />}
                label='Settings'
              />
            </SidebarTooltip>
          )}
        </Link>
      </Stack>
      {isMobile && <SidebarMenuLogout />}
    </Stack>
  )
})

const SidebarTooltip = (props: { collapsed: boolean; text: React.ReactNode; children: React.ReactNode }) => {
  const { collapsed, text, children } = props
  return (
    <Tooltip enterDelay={0} placement='right' text={text} opened={collapsed ? undefined : false}>
      {children}
    </Tooltip>
  )
}

const styles = css.create({
  root: {
    flex: 1,
    width: '100%',
    borderRadius: shape.lg,
    backgroundColor: 'transparent',
  },
  wrapper: {
    width: '100%',
    paddingInline: 12,
    gap: 4,
  },
  gray: {
    color: palette.onSurfaceVariant,
    fontWeight: 500,
  },
})
