import { Divider } from '@/components/ui/Divider/Divider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Menu } from '@/components/ui/Menu/Menu'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { spacing } from '@/themes/spacing.stylex'
import {
  IconBookmark,
  IconCopy,
  IconDotsVertical,
  IconEyeOff,
  IconInfoSquareRounded,
  IconLink,
  IconUserMinus,
} from '@tabler/icons-react'
import Dialog from 'components/elements/Layouts/Dialog'
import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import { css } from 'react-strict-dom'
import { toast } from 'sonner'
import type Note from 'stores/models/note'
import PostStats from './PostDialogs/PostStats'

type Props = {
  note: Note
  dense?: boolean
}

type PropsOptions = {
  onCopyIdClick: () => void
  onCopyAuthorIdClick: () => void
  onCopyLinkClick: () => void
  onDetailsClick: () => void
}

function isMobileDevice() {
  return 'ontouchstart' in window
}

function Options(props: PropsOptions) {
  return (
    <>
      <MenuItem leadingIcon={<IconInfoSquareRounded />} label='Details' onClick={props.onDetailsClick} />
      <Divider />
      <MenuItem leadingIcon={<IconCopy />} label='Copy ID' onClick={props.onCopyIdClick} />
      <MenuItem leadingIcon={<IconCopy />} label='Copy Author ID' onClick={props.onCopyAuthorIdClick} />
      <MenuItem leadingIcon={<IconLink />} label='Copy Link' onClick={props.onCopyLinkClick} />
      <Divider />
      <Text variant='label' size='sm' sx={styles.label}>
        Coming Soon
      </Text>
      <MenuItem disabled leadingIcon={<IconBookmark />} label='Bookmark' />
      <MenuItem disabled variant='danger' leadingIcon={<IconEyeOff />} label='Mute' />
      <MenuItem disabled variant='danger' leadingIcon={<IconUserMinus />} label='Unfollow' />
    </>
  )
}

const PostOptions = observer(function PostOptions(props: Props) {
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
            toast('Copied', { closeButton: false, position: 'bottom-right', style: { right: 0, width: 'fit-content' } })
            handleClose()
          })
        }
      }
    },
    [handleClose],
  )

  const handleDetailsDialog = useCallback(() => {
    setDebugDialog(!debugDialog)
  }, [debugDialog])

  const nevent = note.nevent
  const link = window.location.origin + '/' + nevent

  return (
    <>
      <Dialog title='Stats' open={debugDialog} onClose={handleClose} maxWidth='sm'>
        <PostStats note={note} />
      </Dialog>
      {!isMobile && (
        <Menu
          sx={styles.menu}
          placement='bottom-end'
          trigger={({ getProps }) => (
            <IconButton
              {...getProps()}
              size={dense ? 'sm' : 'md'}
              icon={<IconDotsVertical stroke='currentColor' strokeWidth='2.0' size={dense ? 18 : 20} />}
            />
          )}>
          <Options
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
          <Dialog open={open} onClose={() => setOpen(false)} mobileAnchor='middle'>
            <Stack horizontal={false}>
              <MenuList elevation={0} sx={styles.menuList}>
                <Options
                  onCopyIdClick={handleCopy(nevent)}
                  onCopyAuthorIdClick={handleCopy(note.nprofile as string | undefined)}
                  onCopyLinkClick={handleCopy(link)}
                  onDetailsClick={handleDetailsDialog}
                />
              </MenuList>
            </Stack>
          </Dialog>
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
    width: '100%',
  },
})

export default PostOptions
