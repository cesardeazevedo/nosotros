import { Avatar } from '@/components/ui/Avatar/Avatar'
import { Divider } from '@/components/ui/Divider/Divider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Menu } from '@/components/ui/Menu/Menu'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { Note } from '@/stores/notes/note'
import { spacing } from '@/themes/spacing.stylex'
import {
  IconBookmark,
  IconCopy,
  IconDotsVertical,
  IconExternalLink,
  IconEyeOff,
  IconInfoSquareRounded,
  IconLink,
  IconUserMinus,
} from '@tabler/icons-react'
import { DialogSheet } from 'components/elements/Layouts/Dialog'
import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import { css, html } from 'react-strict-dom'
import { PostStats } from './PostDialogs/PostStats'
import { toastStore } from '@/stores/ui/toast.store'

type Props = {
  note: Note
  dense?: boolean
}

type PropsOptions = {
  note: Note
  onCopyIdClick: () => void
  onCopyAuthorIdClick: () => void
  onCopyLinkClick: () => void
  onDetailsClick: () => void
}

type PropsMenuItems = {
  nevent?: string
  isMobile?: boolean
}

function isMobileDevice() {
  return 'ontouchstart' in window
}

const PostMenuOpenInItems = (props: PropsMenuItems) => {
  const { nevent, isMobile = false } = props
  return (
    <>
      <MenuItem
        href={`https://coracle.social/notes/${nevent}`}
        target='_blank'
        rel='noreferrer'
        leadingIcon={<Avatar size='xs' src='/clients/coracle.png' />}
        label='Coracle'
        onClick={() => {}}
      />
      <MenuItem
        href={`https://njump.me/${nevent}`}
        target='_blank'
        rel='noreferrer'
        leadingIcon={<Avatar size='xs' src='/clients/njump.png' />}
        label='Njump'
      />
      <MenuItem
        href={`https://nostrudel.ninja/#/n/${nevent}`}
        target='_blank'
        rel='noreferrer'
        leadingIcon={<Avatar size='xs' src='/clients/nostrudel.png' />}
        label='NoStrudel'
      />
      <MenuItem
        href={`https://snort.social/${nevent}`}
        target='_blank'
        rel='noreferrer'
        leadingIcon={<Avatar size='xs' src='/clients/snort.svg' />}
        label='Snort'
      />
      <MenuItem
        href={`https://iris.to/${nevent}`}
        target='_blank'
        rel='noreferrer'
        leadingIcon={<Avatar size='xs' src='/clients/iris.webp' />}
        label='Iris'
      />
      <MenuItem
        href={isMobile ? `primal:nostr:${nevent}` : `https://primal.net/e/${nevent}`}
        target='_blank'
        rel='noreferrer'
        leadingIcon={<Avatar size='xs' src='/clients/primal.svg' />}
        label='Primal'
        onClick={() => {}}
      />
      <MenuItem
        href={isMobile ? `damus:nostr:${nevent}` : `https://damus.io/${nevent}`}
        target='_blank'
        rel='noreferrer'
        leadingIcon={<Avatar size='xs' src='/clients/damus.png' />}
        label='Damus'
        onClick={() => {}}
      />
    </>
  )
}

const PostMenuOpenIn = observer(function PostMenuOpenIn(props: PropsMenuItems) {
  const { nevent } = props
  const isMobile = isMobileDevice()
  const [open, setOpen] = useState(false)
  return (
    <>
      <Divider />
      {isMobile && (
        <DialogSheet open={open} onClose={() => setOpen(false)} mobileAnchor='middle'>
          <html.div style={styles.clientHeader}>
            <Text variant='label' size='lg'>
              Choose a nostr app
            </Text>
          </html.div>
          <MenuList elevation={0} sx={styles.menuList}>
            <PostMenuOpenInItems nevent={nevent} />
          </MenuList>
        </DialogSheet>
      )}
      <MenuItem leadingIcon={<IconExternalLink />} label='Open In' onClick={() => isMobile && setOpen(true)}>
        {!isMobile && <PostMenuOpenInItems nevent={nevent} />}
      </MenuItem>
    </>
  )
})

const Options = observer(function (props: PropsOptions) {
  return (
    <>
      <MenuItem leadingIcon={<IconInfoSquareRounded />} label='Details' onClick={props.onDetailsClick} />
      <Divider />
      <MenuItem leadingIcon={<IconCopy />} label='Copy ID' onClick={props.onCopyIdClick} />
      <MenuItem leadingIcon={<IconCopy />} label='Copy Author ID' onClick={props.onCopyAuthorIdClick} />
      <MenuItem leadingIcon={<IconLink />} label='Copy Link' onClick={props.onCopyLinkClick} />
      <PostMenuOpenIn nevent={props.note.nevent} />
      <Divider />
      <Text variant='label' size='sm' sx={styles.label}>
        Coming Soon
      </Text>
      <MenuItem disabled leadingIcon={<IconBookmark />} label='Bookmark' />
      <MenuItem disabled variant='danger' leadingIcon={<IconEyeOff />} label='Mute' />
      <MenuItem disabled variant='danger' leadingIcon={<IconUserMinus />} label='Unfollow' />
    </>
  )
})

export const PostOptions = observer(function PostOptions(props: Props) {
  const { dense = false, note } = props
  const [debugDialog, setDebugDialog] = useState(false)
  const [open, setOpen] = useState(false)
  const isMobile = isMobileDevice()

  const handleClose = useCallback(() => {
    setDebugDialog(false)
  }, [])

  const handleCopy = useCallback(
    (value: string | undefined) => {
      return () => {
        if (value) {
          const type = 'text/plain'
          const blob = new Blob([value], { type })
          window.navigator.clipboard.write([new ClipboardItem({ [type]: blob })]).then(() => {
            toastStore.enqueue('Copied', { duration: 4000 })
            handleClose()
          })
        }
      }
    },
    [note, handleClose],
  )

  const handleDetailsDialog = useCallback(() => {
    setDebugDialog(!debugDialog)
  }, [debugDialog])

  const nevent = note.nevent
  const link = window.location.origin + '/' + nevent

  return (
    <>
      <DialogSheet title='Stats' open={debugDialog} onClose={handleClose} maxWidth='sm'>
        <PostStats note={note} />
      </DialogSheet>
      {!isMobile && (
        <Menu
          sx={styles.menu}
          placement='bottom-end'
          surface='surfaceContainerLow'
          trigger={({ getProps }) => (
            <IconButton
              {...getProps()}
              size={dense ? 'sm' : 'md'}
              icon={<IconDotsVertical stroke='currentColor' strokeWidth='2.0' size={dense ? 18 : 20} />}
            />
          )}>
          <Options
            note={note}
            onCopyIdClick={handleCopy(nevent)}
            onCopyAuthorIdClick={handleCopy(note.nprofile as string | undefined)}
            onCopyLinkClick={handleCopy(link)}
            onDetailsClick={handleDetailsDialog}
          />
        </Menu>
      )}
      {isMobile && (
        <>
          <IconButton
            size={dense ? 'sm' : 'md'}
            onClick={() => setOpen(true)}
            icon={<IconDotsVertical stroke='currentColor' strokeWidth='2.0' size={20} />}
          />
          <DialogSheet open={open} onClose={() => setOpen(false)} mobileAnchor='middle'>
            <Stack horizontal={false}>
              <MenuList elevation={0} sx={styles.menuList}>
                <Options
                  note={note}
                  onCopyIdClick={handleCopy(nevent)}
                  onCopyAuthorIdClick={handleCopy(note.nprofile as string | undefined)}
                  onCopyLinkClick={handleCopy(link)}
                  onDetailsClick={handleDetailsDialog}
                />
              </MenuList>
            </Stack>
          </DialogSheet>
        </>
      )}
    </>
  )
})

const styles = css.create({
  menu: {
    width: 240,
  },
  label: {
    marginLeft: spacing.margin2,
  },
  menuList: {
    backgroundColor: 'transparent',
    width: '100%',
  },
  clientHeader: {
    paddingBlock: spacing.padding1,
    paddingInline: spacing.padding2,
  },
})
