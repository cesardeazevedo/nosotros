import { NotificationBadge } from '@/components/modules/Notifications/NotificationBadge'
import { Divider } from '@/components/ui/Divider/Divider'
import { Fab } from '@/components/ui/Fab/Fab'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { useCurrentUser, useRootStore } from '@/hooks/useRootStore'
import { shape } from '@/themes/shape.stylex'
import { encodeSafe } from '@/utils/nip19'
import { IconBell, IconBellFilled, IconListDetails, IconNews, IconPhoto, IconUser } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { nip19 } from 'nostr-tools'
import { css, html } from 'react-strict-dom'
import { IconPencil } from '../Icons/IconPencil'
import { SidebarMenuDecks } from './SidebarMenuDecks'
import { SidebarMenuFeeds } from './SidebarMenuFeeds'
import { SidebarMenuRecents } from './SidebarMenuRecents'
import { SidebarMenuRelays } from './SidebarMenuRelays'

type Props = {
  onAction?: () => void
}

const iconProps = {
  size: 24,
  strokeWidth: '1.8',
}

export const SidebarMenu = observer(function SidebarMenu(props: Props) {
  const root = useRootStore()
  const user = useCurrentUser()
  const handleClickHome = () => {
    setTimeout(() => {
      window.scrollTo({ top: 0 })
    })
  }

  return (
    <Stack horizontal={false} sx={styles.root} gap={1}>
      <Stack horizontal={false} gap={0.5} sx={styles.wrapper}>
        <SidebarMenuFeeds />
        <Link tabIndex={-1} to='/notifications' onClick={handleClickHome}>
          {({ isActive }) => (
            <MenuItem
              selected={isActive}
              sx={styles.item}
              onClick={() => props.onAction?.()}
              leadingIcon={
                <NotificationBadge>
                  {isActive ? <IconBellFilled {...iconProps} /> : <IconBell {...iconProps} />}
                </NotificationBadge>
              }
              label={'Notifications'}
              trailingIcon
            />
          )}
        </Link>
        <Link to='/media'>
          {({ isActive }) => (
            <MenuItem
              selected={isActive}
              sx={styles.item}
              onClick={() => props.onAction?.()}
              leadingIcon={<IconPhoto {...iconProps} />}
              label='Media'
            />
          )}
        </Link>
        <Link to='/articles'>
          {({ isActive }) => (
            <MenuItem
              selected={isActive}
              sx={styles.item}
              onClick={() => props.onAction?.()}
              leadingIcon={<IconNews {...iconProps} />}
              label='Articles'
            />
          )}
        </Link>
        <MenuItem
          selected={false}
          sx={styles.item}
          onClick={() => props.onAction?.()}
          leadingIcon={<IconListDetails {...iconProps} />}
          label='Lists'
        />
        <Link
          to={`/$nostr`}
          params={{
            nostr: (user?.nprofile ||
              (user?.pubkey && encodeSafe(() => nip19.nprofileEncode({ pubkey: user.pubkey })))) as string,
          }}>
          {({ isActive }) => (
            <MenuItem
              selected={isActive}
              sx={styles.item}
              onClick={() => props.onAction?.()}
              leadingIcon={<IconUser {...iconProps} />}
              label='Profile'
            />
          )}
        </Link>
      </Stack>
      <Divider />
      <html.div style={styles.wrapper}>
        <SidebarMenuDecks />
      </html.div>
      <Divider />
      <html.div style={styles.wrapper}>
        <SidebarMenuRecents />
      </html.div>
      {root.recents.list.length !== 0 && <Divider />}
      <html.div style={styles.wrapper}>
        <SidebarMenuRelays sx={styles.item} />
        <br />
        <Link to='.' search={{ compose: true }}>
          <Fab flat size='sm' variant='primary' icon={<IconPencil />} label='Create note' fullWidth />
        </Link>
      </html.div>
      {/* <html.div style={styles.wrapper}> */}
      {/*   <Link to='/settings'> */}
      {/*     <MenuItem */}
      {/*       sx={styles.item} */}
      {/*       leadingIcon={<IconSettings {...iconProps} />} */}
      {/*       onClick={props.onAction} */}
      {/*       label='Settings' */}
      {/*     /> */}
      {/*   </Link> */}
      {/* </html.div> */}

      {/* <Divider /> */}
      {/* <MenuItem */}
      {/*   sx={styles.item} */}
      {/*   onClick={() => { */}
      {/*     logout() */}
      {/*     props.onAction?.() */}
      {/*   }} */}
      {/*   leadingIcon={<IconLogout {...iconProps} />} */}
      {/*   label='Log out' */}
      {/* /> */}
    </Stack>
  )
})

const styles = css.create({
  root: {
    width: '100%',
    borderRadius: shape.lg,
    backgroundColor: 'transparent',
    // [listItemTokens.containerMinHeight$sm]: 50,
    // [listItemTokens.leadingSpace]: spacing.padding2,
  },
  wrapper: {
    width: '100%',
    paddingInline: 12,
  },
  button: {
    height: 50,
  },
  item: {
    // width: '100%',
    // padding: spacing.padding1,
    // paddingLeft: spacing.padding3,
  },
  thick: {
    // fontWeight: 500,
  },
})
