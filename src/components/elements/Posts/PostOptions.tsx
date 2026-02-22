import { statsDialogAtom } from '@/atoms/dialog.atoms'
import { enqueueToastAtom } from '@/atoms/toaster.atoms'
import { ListMuteOptionsDialog } from '@/components/modules/Lists/ListMuteOptionsDialog'
import { useContentContext } from '@/components/providers/ContentProvider'
import { Divider } from '@/components/ui/Divider/Divider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { Popover } from '@/components/ui/Popover/Popover'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useUserState } from '@/hooks/state/useUser'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useNevent } from '@/hooks/useEventUtils'
import { READ } from '@/nostr/types'
import { spacing } from '@/themes/spacing.stylex'
import {
  IconBookmark,
  IconCopy,
  IconDotsVertical,
  IconExternalLink,
  IconInfoSquareRounded,
  IconLink,
  IconMessageOff,
  IconQuote,
  IconShare3,
  IconUserCancel,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { memo, useCallback, useState } from 'react'
import { css, html } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'
import { ContentLink } from '../Content/Link/Link'
import { PostBookmarkOptions } from './PostBookmarkOptions'

type PropsOptions = {
  event: NostrEventDB
  nevent: string | undefined
  canMute: boolean
  onCopyIdClick: (e: StrictClickEvent) => void
  onCopyAuthorIdClick: (e: StrictClickEvent) => void
  onCopyLinkClick: (e: StrictClickEvent) => void
  onBookmarkClick: (e: StrictClickEvent) => void
  onDetailsClick: (e: StrictClickEvent) => void
  onMuteClick: (e: StrictClickEvent) => void
  onMuteNoteClick: (e: StrictClickEvent) => void
}

const iconProps = { size: 20 }

const Options = memo(function Options(props: PropsOptions) {
  const { event, nevent } = props
  const itemProps = { interactive: true, size: 'sm' } as const
  return (
    <>
      <html.div style={styles.wrapper}>
        <Link to='/feed' search={{ kind: 1, q: event.id, pubkey: event.pubkey, permission: READ, type: 'quotes' }}>
          <MenuItem {...itemProps} leadingIcon={<IconQuote {...iconProps} />} label='See quotes' />
        </Link>
        <Link to='/feed' search={{ kind: 6, e: event.id, pubkey: event.pubkey, permission: READ, type: 'reposts' }}>
          <MenuItem {...itemProps} leadingIcon={<IconShare3 {...iconProps} />} label='See reposts' />
        </Link>
      </html.div>
      <Divider />
      <html.div style={styles.wrapper}>
        <MenuItem
          {...itemProps}
          leadingIcon={<IconBookmark {...iconProps} />}
          label='Bookmark'
          onClick={props.onBookmarkClick}
        />
      </html.div>
      <Divider />
      <html.div style={styles.wrapper}>
        <MenuItem
          {...itemProps}
          leadingIcon={<IconInfoSquareRounded {...iconProps} />}
          label='Details'
          onClick={props.onDetailsClick}
        />
        <MenuItem
          {...itemProps}
          leadingIcon={<IconCopy {...iconProps} />}
          label='Copy ID'
          onClick={props.onCopyIdClick}
        />
        <MenuItem
          {...itemProps}
          leadingIcon={<IconCopy {...iconProps} />}
          label='Copy Author ID'
          onClick={props.onCopyAuthorIdClick}
        />
        <MenuItem
          {...itemProps}
          leadingIcon={<IconLink {...iconProps} />}
          label='Copy Link'
          onClick={props.onCopyLinkClick}
        />
        <ContentLink tooltip={false} underline={false} href={`https://njump.me/${nevent}`} sx={styles.link}>
          <MenuItem {...itemProps} leadingIcon={<IconExternalLink {...iconProps} />} label='Njump.me' />
        </ContentLink>
      </html.div>
      <Divider />
      {props.canMute && (
        <html.div style={styles.wrapper}>
          <MenuItem
            {...itemProps}
            label='Mute User'
            variant='danger'
            leadingIcon={<IconUserCancel {...iconProps} />}
            onClick={props.onMuteClick}
          />
          <MenuItem
            {...itemProps}
            label='Mute Note'
            variant='danger'
            leadingIcon={<IconMessageOff {...iconProps} />}
            onClick={props.onMuteNoteClick}
          />
        </html.div>
      )}
      {/* <MenuItem disabled variant='danger' leadingIcon={<IconEyeOff />} label='Mute' /> */}
      {/* <MenuItem disabled variant='danger' leadingIcon={<IconUserMinus />} label='Unfollow' /> */}
    </>
  )
})

type Props = {
  event: NostrEventDB
}

export const PostOptions = memo(function PostOptions(props: Props) {
  const { event } = props
  const { dense } = useContentContext()
  const pubkey = useCurrentPubkey()
  const enqueueToast = useSetAtom(enqueueToastAtom)
  const setStatsDialog = useSetAtom(statsDialogAtom)
  const [bookmarkDialogOpen, setBookmarkDialogOpen] = useState(false)
  const [muteDialogTarget, setMuteDialogTarget] = useState<{ pubkey: string; eventId?: string } | null>(null)

  const handleCopy = useCallback((value: string | undefined) => {
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
  }, [])

  const nevent = useNevent(event)
  const link = window.location.origin + '/' + nevent
  const user = useUserState(event.pubkey)
  const canMute = !!pubkey && event.pubkey !== pubkey

  return (
    <>
      <Popover
        sx={styles.menu}
        placement='bottom-end'
        contentRenderer={(props) => (
          <MenuList surface='surfaceContainerLow' sx={styles.menuList}>
            <Options
              event={event}
              nevent={nevent}
              canMute={canMute}
              onCopyIdClick={handleCopy(nevent)}
              onCopyAuthorIdClick={handleCopy(user?.nprofile)}
              onCopyLinkClick={handleCopy(link)}
              onBookmarkClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                if (pubkey) {
                  setBookmarkDialogOpen(true)
                  props.close()
                }
              }}
              onDetailsClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                setStatsDialog(event.id)
                props.close()
              }}
              onMuteClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                setMuteDialogTarget({ pubkey: event.pubkey })
                props.close()
              }}
              onMuteNoteClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                setMuteDialogTarget({ pubkey: event.pubkey, eventId: event.id })
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
            icon={<IconDotsVertical stroke='currentColor' strokeWidth='2.0' size={dense ? 16 : 18} opacity={0.8} />}
          />
        )}
      </Popover>
      <PostBookmarkOptions
        open={bookmarkDialogOpen}
        postId={event.id}
        onClose={() => {
          setBookmarkDialogOpen(false)
        }}
      />
      <ListMuteOptionsDialog
        open={!!muteDialogTarget}
        targetPubkey={muteDialogTarget?.pubkey}
        targetEventId={muteDialogTarget?.eventId}
        onClose={() => {
          setMuteDialogTarget(null)
        }}
      />
    </>
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
    paddingInline: 0,
  },
  wrapper: {
    paddingInline: spacing.padding1,
  },
  link: {
    width: '100%',
  },
})
