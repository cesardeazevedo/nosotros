import { useNoteContext } from '@/components/providers/NoteProvider'
import { Divider } from '@/components/ui/Divider/Divider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Menu } from '@/components/ui/Menu/Menu'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { Stack } from '@/components/ui/Stack/Stack'
import type { Comment } from '@/stores/comment/comment'
import type { Note } from '@/stores/notes/note'
import { toastStore } from '@/stores/ui/toast.store'
import { spacing } from '@/themes/spacing.stylex'
import { IconCopy, IconDotsVertical, IconInfoSquareRounded, IconLink } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { DialogSheet } from 'components/elements/Layouts/Dialog'
import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  note: Note | Comment
  dense?: boolean
}

type PropsOptions = {
  note: Note | Comment
  onCopyIdClick: () => void
  onCopyAuthorIdClick: () => void
  onCopyLinkClick: () => void
  onDetailsClick: () => void
}

function isMobileDevice() {
  return 'ontouchstart' in window
}

const Options = observer(function Options(props: PropsOptions) {
  return (
    <>
      <MenuItem leadingIcon={<IconInfoSquareRounded />} label='Details' onClick={props.onDetailsClick} />
      <Divider />
      <MenuItem leadingIcon={<IconCopy />} label='Copy ID' onClick={props.onCopyIdClick} />
      <MenuItem leadingIcon={<IconCopy />} label='Copy Author ID' onClick={props.onCopyAuthorIdClick} />
      <MenuItem leadingIcon={<IconLink />} label='Copy Link' onClick={props.onCopyLinkClick} />
      {/* <PostMenuOpenIn nevent={props.note.nevent} /> */}
      {/* <Divider /> */}
      {/* <Text variant='label' size='sm' sx={styles.label}> */}
      {/*   Coming Soon */}
      {/* </Text> */}
      {/* <MenuItem disabled leadingIcon={<IconBookmark />} label='Bookmark' /> */}
      {/* <MenuItem disabled variant='danger' leadingIcon={<IconEyeOff />} label='Mute' /> */}
      {/* <MenuItem disabled variant='danger' leadingIcon={<IconUserMinus />} label='Unfollow' /> */}
    </>
  )
})

export const PostOptions = observer(function PostOptions(props: Props) {
  const { note } = props
  const { dense } = useNoteContext()
  const [open, setOpen] = useState(false)
  const isMobile = isMobileDevice()
  const navigate = useNavigate()

  const handleCopy = useCallback(
    (value: string | undefined) => {
      return () => {
        if (value) {
          const type = 'text/plain'
          const blob = new Blob([value], { type })
          window.navigator.clipboard.write([new ClipboardItem({ [type]: blob })]).then(() => {
            toastStore.enqueue('Copied', { duration: 4000 })
            setOpen(false)
          })
        }
      }
    },
    [note],
  )

  const handleStatsClick = useCallback(() => {
    // @ts-ignore
    navigate({ search: { stats: note.id } })
  }, [])

  const nevent = note.nevent
  const link = window.location.origin + '/' + nevent

  return (
    <>
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
            onCopyAuthorIdClick={handleCopy(note.user?.nprofile)}
            onCopyLinkClick={handleCopy(link)}
            onDetailsClick={handleStatsClick}
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
                  onCopyAuthorIdClick={handleCopy(note.user?.nprofile)}
                  onCopyLinkClick={handleCopy(link)}
                  onDetailsClick={handleStatsClick}
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
