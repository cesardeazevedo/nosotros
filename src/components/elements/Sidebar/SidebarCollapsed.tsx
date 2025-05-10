import { NotificationBadge } from '@/components/modules/Notifications/NotificationBadge'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { SxProps } from '@/components/ui/types'
import { useCurrentPubkey, useCurrentUser, useGlobalSettings, useRootStore } from '@/hooks/useRootStore'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import {
  IconBell,
  IconBellFilled,
  IconLayoutSidebarLeftExpandFilled,
  IconListDetails,
  IconNews,
  IconPhoto,
  IconUser,
  IconUserFilled,
  IconWorldBolt,
} from '@tabler/icons-react'
import { Link, useMatchRoute } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { useContext, type RefObject } from 'react'
import { css } from 'react-strict-dom'
import { IconButtonSearch } from '../Buttons/IconButtonSearch'
import { IconHome } from '../Icons/IconHome'
import { IconHomeFilled } from '../Icons/IconHomeFilled'
import { ProfilePopover } from '../Navigation/ProfilePopover'
import { SidebarContext } from './SidebarContext'

type Props = {
  ref?: RefObject<null>
  sx?: SxProps
}

export const SidebarCollapsed = observer(function SidebarCollapsed(props: Props) {
  const global = useGlobalSettings()
  const { decks } = useRootStore()
  const user = useCurrentUser()
  const pubkey = useCurrentPubkey()
  const match = useMatchRoute()
  const context = useContext(SidebarContext)
  const iconProps = {
    size: 26,
    strokeWidth: '1.6',
    className: css.props(styles.icon).className,
  }
  const isNoPane = !context.pane
  const isNotifications = context.pane === '/notifications' || (!!match({ to: '/notifications' }) && isNoPane)
  return (
    <Stack
      ref={props.ref}
      horizontal={false}
      justify='space-between'
      align='center'
      sx={[styles.root, props.sx]}
      gap={1}>
      <Stack horizontal={false} align='center' gap={1}>
        <IconButton
          sx={styles.iconButton}
          onClick={() => {
            context.setPane(false)
            global.toggle('sidebarCollapsed', false)
          }}>
          <IconLayoutSidebarLeftExpandFilled {...iconProps} />
        </IconButton>
        {/* <Tooltip cursor='arrow' enterDelay={0} text='Create note' placement='right'> */}
        {/*   <Link to='/' search={{ compose: true }}> */}
        {/*     <Fab flat variant='primary' icon={<IconPencil />} /> */}
        {/*   </Link> */}
        {/* </Tooltip> */}
        <Link to='/'>
          {({ isActive }) => (
            <IconButton
              selected={isActive && isNoPane}
              toggle
              sx={styles.iconButton}
              icon={<IconHome {...iconProps} />}
              selectedIcon={<IconHomeFilled {...iconProps} />}
              onClick={() => context.setPane(false)}
            />
          )}
        </Link>
        <IconButton
          toggle
          selected={isNotifications}
          disabled={!pubkey}
          sx={styles.iconButton}
          icon={
            <NotificationBadge>
              {isNotifications ? <IconBellFilled {...iconProps} /> : <IconBell {...iconProps} />}
            </NotificationBadge>
          }
          onClick={() => context.setPane('/notifications')}
        />
        <Link to='/media'>
          {({ isActive }) => (
            <IconButton
              selected={isActive && isNoPane}
              toggle
              sx={styles.iconButton}
              icon={<IconPhoto {...iconProps} />}
              onClick={() => context.setPane(false)}
            />
          )}
        </Link>
        <Link to='/articles'>
          {({ isActive }) => (
            <IconButton
              selected={isActive && isNoPane}
              toggle
              sx={styles.iconButton}
              icon={<IconNews {...iconProps} strokeWidth={1.4} />}
              onClick={() => context.setPane(false)}
            />
          )}
        </Link>
        <IconButton
          toggle
          disabled={!pubkey}
          selected={context.pane === '/lists' || !!match({ to: '/lists' })}
          sx={styles.iconButton}
          icon={<IconListDetails {...iconProps} strokeWidth={1.4} />}
          onClick={() => context.setPane('/lists')}
        />
        <Link to='/$nostr' params={{ nostr: `${user?.nprofile}` }}>
          {({ isActive }) => (
            <IconButton
              toggle
              selected={isActive && isNoPane}
              disabled={!pubkey}
              sx={styles.iconButton}
              icon={<IconUser {...iconProps} />}
              selectedIcon={<IconUserFilled {...iconProps} />}
              onClick={() => context.setPane(false)}
            />
          )}
        </Link>
      </Stack>
      <Stack horizontal={false} gap={1} align='center'>
        <Text variant='label' size='sm' sx={styles.label}>
          DECKS
        </Text>
        <Stack horizontal={false} sx={styles.decks} gap={0.5}>
          {decks.list.map((deck) => (
            <Link key={deck.id} to='/deck/$id' params={{ id: deck.id }} onClick={() => context.setPane(false)}>
              {({ isActive }) => <IconButton selected={isActive} toggle sx={styles.deckIconButton} icon={deck.icon} />}
            </Link>
          ))}
        </Stack>
      </Stack>
      <Stack horizontal={false} gap={2} align='center'>
        {/* <Tooltip cursor='arrow' enterDelay={0} text='Add column' placement='right'> */}
        {/*   <IconButton icon={<IconSquareRoundedPlus size={28} strokeWidth='1.5' />} /> */}
        {/* </Tooltip> */}
        <IconButton
          toggle
          selected={context.pane === '/explore/relays' || !!match({ to: '/explore/relays' })}
          onClick={() => context.setPane('/explore/relays')}>
          <IconWorldBolt {...iconProps} />
        </IconButton>
        <IconButtonSearch placement='right' sx={styles.iconButton} {...iconProps} />
        <ProfilePopover />
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  root: {
    position: 'fixed',
    backgroundColor: palette.surfaceContainerLowest,
    paddingTop: spacing.padding2,
    paddingBottom: spacing.padding4,
    borderRightWidth: 1,
    borderRightColor: palette.outlineVariant,
    left: 0,
    top: 0,
    bottom: 0,
    width: 84,
    zIndex: 100,
  },
  iconButton: {
    width: 50,
    height: 50,
    color: palette.onSurface,
    padding: spacing.padding2,
  },
  deckIconButton: {
    width: 50,
    height: 50,
    fontSize: 24,
  },
  icon: {
    color: palette.onSurface,
  },
  decks: {
    borderRadius: shape.full,
    padding: 0,
  },
  label: {
    color: palette.onSurfaceVariant,
    letterSpacing: 1,
  },
})
