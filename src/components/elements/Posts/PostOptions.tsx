import { statsDialogAtom } from '@/atoms/dialog.atoms'
import { enqueueToastAtom } from '@/atoms/toaster.atoms'
import { useContentContext } from '@/components/providers/ContentProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { Divider } from '@/components/ui/Divider/Divider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { Popover } from '@/components/ui/Popover/Popover'
import type { NoteState } from '@/hooks/state/useNote'
import { useUserState } from '@/hooks/state/useUser'
import { READ } from '@/nostr/types'
import { spacing } from '@/themes/spacing.stylex'
import { IconCopy, IconDotsVertical, IconInfoSquareRounded, IconLink, IconQuote, IconShare3 } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { memo, useCallback } from 'react'
import { css } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'

type PropsOptions = {
  note: NoteState
  onCopyIdClick: (e: StrictClickEvent) => void
  onCopyAuthorIdClick: (e: StrictClickEvent) => void
  onCopyLinkClick: (e: StrictClickEvent) => void
  onDetailsClick: (e: StrictClickEvent) => void
}

const iconProps = { size: 20 }

const Options = memo(function Options(props: PropsOptions) {
  const { note } = props
  return (
    <>
      <Link to='/feed' search={{ kind: 1, q: note.id, pubkey: note.event.pubkey, permission: READ, type: 'quotes' }}>
        <MenuItem size='sm' leadingIcon={<IconQuote {...iconProps} />} label='See quotes' onClick={() => {}} />
      </Link>
      <Link to='/feed' search={{ kind: 6, e: note.id, pubkey: note.event.pubkey, permission: READ, type: 'reposts' }}>
        <MenuItem size='sm' leadingIcon={<IconShare3 {...iconProps} />} label='See reposts' onClick={() => {}} />
      </Link>
      <Divider />
      <MenuItem
        size='sm'
        leadingIcon={<IconInfoSquareRounded {...iconProps} />}
        label='Details'
        onClick={props.onDetailsClick}
      />
      <MenuItem size='sm' leadingIcon={<IconCopy {...iconProps} />} label='Copy ID' onClick={props.onCopyIdClick} />
      <MenuItem
        size='sm'
        leadingIcon={<IconCopy {...iconProps} />}
        label='Copy Author ID'
        onClick={props.onCopyAuthorIdClick}
      />
      <MenuItem size='sm' leadingIcon={<IconLink {...iconProps} />} label='Copy Link' onClick={props.onCopyLinkClick} />
      {/* <MenuItem disabled leadingIcon={<IconBookmark />} label='Bookmark' /> */}
      {/* <MenuItem disabled variant='danger' leadingIcon={<IconEyeOff />} label='Mute' /> */}
      {/* <MenuItem disabled variant='danger' leadingIcon={<IconUserMinus />} label='Unfollow' /> */}
    </>
  )
})

export const PostOptions = memo(function PostOptions() {
  const { dense } = useContentContext()
  const { note } = useNoteContext()
  const enqueueToast = useSetAtom(enqueueToastAtom)
  const setStatsDialog = useSetAtom(statsDialogAtom)

  const handleCopy = useCallback(
    (value: string | undefined) => {
      return (e: StrictClickEvent) => {
        e.stopPropagation()
        e.preventDefault()
        if (value) {
          const type = 'text/plain'
          const blob = new Blob([value], { type })
          window.navigator.clipboard.write([new ClipboardItem({ [type]: blob })]).then(() => {
            enqueueToast({ component: 'Copied', duration: 4000 })
          })
        }
      }
    },
    [note],
  )

  const nevent = note?.nip19
  const link = window.location.origin + '/' + nevent
  const user = useUserState(note.event.pubkey)

  return (
    <Popover
      sx={styles.menu}
      placement='bottom-end'
      contentRenderer={(props) => (
        <MenuList surface='surfaceContainerLow'>
          <Options
            note={note}
            onCopyIdClick={handleCopy(nevent)}
            onCopyAuthorIdClick={handleCopy(user?.nprofile)}
            onCopyLinkClick={handleCopy(link)}
            onDetailsClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              setStatsDialog(note.id)
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
            e.preventDefault()
            e.stopPropagation()
            open()
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
    width: 230,
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
