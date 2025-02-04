import { useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { Divider } from '@/components/ui/Divider/Divider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { Popover } from '@/components/ui/Popover/Popover'
import { toastStore } from '@/stores/ui/toast.store'
import { spacing } from '@/themes/spacing.stylex'
import { IconCopy, IconDotsVertical, IconInfoSquareRounded, IconLink } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { css } from 'react-strict-dom'

type PropsOptions = {
  onCopyIdClick: () => void
  onCopyAuthorIdClick: () => void
  onCopyLinkClick: () => void
  onDetailsClick: () => void
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

export const PostOptions = observer(function PostOptions() {
  const { dense } = useContentContext()
  const { note } = useNoteContext()
  const navigate = useNavigate()

  const handleCopy = useCallback(
    (value: string | undefined) => {
      return () => {
        if (value) {
          const type = 'text/plain'
          const blob = new Blob([value], { type })
          window.navigator.clipboard.write([new ClipboardItem({ [type]: blob })]).then(() => {
            toastStore.enqueue('Copied', { duration: 4000 })
          })
        }
      }
    },
    [note],
  )

  const handleStatsClick = useCallback(() => {
    navigate({ to: '.', search: ({ ...rest }) => ({ ...rest, stats: note.id }) })
  }, [])

  const nevent = note?.event.nevent
  const link = window.location.origin + '/' + nevent

  return (
    <Popover
      sx={styles.menu}
      placement='bottom-end'
      contentRenderer={(props) => (
        <MenuList surface='surfaceContainerLow'>
          <Options
            onCopyIdClick={handleCopy(nevent)}
            onCopyAuthorIdClick={handleCopy(note?.user?.nprofile)}
            onCopyLinkClick={handleCopy(link)}
            onDetailsClick={() => {
              handleStatsClick()
              props.close()
            }}
          />
        </MenuList>
      )}>
      {({ getProps, setRef, open }) => (
        <IconButton
          {...getProps()}
          ref={setRef}
          onClick={(e) => {
            open()
            e.preventDefault()
          }}
          size={dense ? 'sm' : 'md'}
          icon={<IconDotsVertical stroke='currentColor' strokeWidth='2.0' size={dense ? 18 : 20} />}
        />
      )}
    </Popover>
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
