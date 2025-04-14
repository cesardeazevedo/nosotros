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
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import type { RefObject } from 'react'
import { css } from 'react-strict-dom'
import { IconButtonSearch } from '../Buttons/IconButtonSearch'
import { IconHome } from '../Icons/IconHome'
import { IconHomeFilled } from '../Icons/IconHomeFilled'
import { ProfilePopover } from '../Navigation/ProfilePopover'

type Props = {
  ref?: RefObject<null>
  sx?: SxProps
}

export const SidebarCollapsed = observer(function SidebarCollapsed(props: Props) {
  const global = useGlobalSettings()
  const { decks } = useRootStore()
  const user = useCurrentUser()
  const pubkey = useCurrentPubkey()
  const iconProps = {
    size: 26,
    strokeWidth: '1.6',
    className: css.props(styles.icon).className,
  }
  return (
    <Stack
      ref={props.ref}
      horizontal={false}
      justify='space-between'
      align='center'
      sx={[styles.root, props.sx]}
      gap={1}>
      <Stack horizontal={false} align='center' gap={1}>
        <IconButton sx={styles.iconButton} onClick={() => global.toggle('sidebarCollapsed', false)}>
          <IconLayoutSidebarLeftExpandFilled {...iconProps} />
        </IconButton>
        {/* <Tooltip cursor='arrow' enterDelay={0} text='Create note' placement='right'> */}
        {/*   <Link to='/' search={{ compose: true }}> */}
        {/*     <Fab flat variant='primary' icon={<IconPencil />} /> */}
        {/*   </Link> */}
        {/* </Tooltip> */}
        {/* <br /> */}
        <Link to='/'>
          {({ isActive }) => (
            <IconButton
              selected={isActive}
              toggle
              sx={styles.iconButton}
              icon={<IconHome {...iconProps} />}
              selectedIcon={<IconHomeFilled {...iconProps} />}
            />
          )}
        </Link>
        {pubkey && (
          <Link to='/notifications'>
            {({ isActive }) => (
              <IconButton
                selected={isActive}
                toggle
                sx={styles.iconButton}
                icon={<IconBell {...iconProps} />}
                selectedIcon={<IconBellFilled {...iconProps} />}
              />
            )}
          </Link>
        )}
        <Link to='/media'>
          {({ isActive }) => (
            <IconButton selected={isActive} toggle sx={styles.iconButton} icon={<IconPhoto {...iconProps} />} />
          )}
        </Link>
        <Link to='/articles'>
          {({ isActive }) => (
            <IconButton
              selected={isActive}
              toggle
              sx={styles.iconButton}
              icon={<IconNews {...iconProps} strokeWidth={1.4} />}
            />
          )}
        </Link>
        <IconButton
          selected={false}
          toggle
          sx={styles.iconButton}
          icon={<IconListDetails {...iconProps} strokeWidth={1.4} />}
        />
        <Link to='/$nostr' params={{ nostr: `${user?.nprofile}` }}>
          {({ isActive }) => (
            <IconButton
              selected={isActive}
              toggle
              sx={styles.iconButton}
              icon={<IconUser {...iconProps} />}
              selectedIcon={<IconUserFilled {...iconProps} />}
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
            <Link key={deck.id} to='/deck/$id' params={{ id: deck.id }}>
              {({ isActive }) => (
                <IconButton selected={isActive} toggle sx={[styles.deckIconButton]} icon={deck.icon} />
              )}
            </Link>
          ))}
        </Stack>
      </Stack>
      <Stack horizontal={false} gap={2} align='center'>
        {/* <Tooltip cursor='arrow' enterDelay={0} text='Add column' placement='right'> */}
        {/*   <IconButton icon={<IconSquareRoundedPlus size={28} strokeWidth='1.5' />} /> */}
        {/* </Tooltip> */}
        <IconButtonSearch placement='right' sx={styles.iconButton} {...iconProps} />
        <ProfilePopover />
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  root: {
    position: 'absolute',
    backgroundColor: palette.surfaceContainerLowest,
    paddingTop: spacing.padding2,
    paddingBottom: spacing.padding4,
    borderRightWidth: 1,
    borderRightColor: palette.outlineVariant,
    left: 0,
    top: 0,
    bottom: 0,
    width: 84,
    zIndex: 1,
  },
  fab: {
    // width: 50,
    // height: 50,
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
    fontSize: 28,
    // border: '1px solid',
    // borderColor: palette.outlineVariant,
    // backgroundColor: 'white',
  },
  icon: {
    color: palette.onSurface,
  },
  decks: {
    // border: '1px solid',
    // borderColor: palette.outlineVariant,
    borderRadius: shape.full,
    padding: 0,
  },
  label: {
    color: palette.onSurfaceVariant,
    letterSpacing: 1,
  },
})
