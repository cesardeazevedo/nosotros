import { statsDialogAtom } from '@/atoms/dialog.atoms'
import { enqueueToastAtom } from '@/atoms/toaster.atoms'
import { useContentContext } from '@/components/providers/ContentProvider'
import { Divider } from '@/components/ui/Divider/Divider'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { Popover } from '@/components/ui/Popover/Popover'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { usePublishEventMutation } from '@/hooks/mutations/usePublishEventMutation'
import { useUserState } from '@/hooks/state/useUser'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useNevent } from '@/hooks/useEventUtils'
import { publishDeleteRequest } from '@/nostr/publish/publishDeleteRequest'
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
  IconTrash,
  IconUserCancel,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { lazy, memo, Suspense, useCallback, useState } from 'react'
import { css, html } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'
import { ContentLink } from '../Content/Link/Link'

const PostBookmarkOptions = lazy(async () =>
  import('./PostBookmarkOptions').then((m) => ({ default: m.PostBookmarkOptions })),
)
const ListMuteOptionsDialog = lazy(async () =>
  import('@/components/modules/Lists/ListMuteOptionsDialog').then((m) => ({ default: m.ListMuteOptionsDialog })),
)

type PropsOptions = {
  event: NostrEventDB
  nevent: string | undefined
  canMute: boolean
  canDelete: boolean
  onCopyIdClick: (e: StrictClickEvent) => void
  onCopyAuthorIdClick: (e: StrictClickEvent) => void
  onCopyLinkClick: (e: StrictClickEvent) => void
  onBookmarkClick: (e: StrictClickEvent) => void
  onDetailsClick: (e: StrictClickEvent) => void
  onRequestDeleteClick: (e: StrictClickEvent) => void
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
        <MenuItem {...itemProps} leadingIcon={<IconCopy {...iconProps} />} label='Copy ID' onClick={props.onCopyIdClick} />
        <MenuItem
          {...itemProps}
          leadingIcon={<IconCopy {...iconProps} />}
          label='Copy Author ID'
          onClick={props.onCopyAuthorIdClick}
        />
        <MenuItem {...itemProps} leadingIcon={<IconLink {...iconProps} />} label='Copy Link' onClick={props.onCopyLinkClick} />
        <ContentLink tooltip={false} underline={false} href={`https://njump.me/${nevent}`} sx={styles.link}>
          <MenuItem {...itemProps} leadingIcon={<IconExternalLink {...iconProps} />} label='Njump.me' />
        </ContentLink>
      </html.div>
      <Divider />
      {props.canDelete && (
        <>
          <html.div style={styles.wrapper}>
            <MenuItem
              {...itemProps}
              label='Request Delete'
              variant='danger'
              leadingIcon={<IconTrash {...iconProps} />}
              onClick={props.onRequestDeleteClick}
            />
          </html.div>
          <Divider />
        </>
      )}
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
    </>
  )
})

const PostOptionsContent = memo(function PostOptionsContent(props: {
  event: NostrEventDB
  onClose: () => void
  onOpenBookmark: () => void
  onOpenMute: (target: { pubkey: string; eventId?: string }) => void
}) {
  const { event, onClose, onOpenBookmark, onOpenMute } = props
  const enqueueToast = useSetAtom(enqueueToastAtom)
  const setStatsDialog = useSetAtom(statsDialogAtom)
  const pubkey = useCurrentPubkey()
  const nevent = useNevent(event)
  const link = window.location.origin + '/' + nevent
  const user = useUserState(event.pubkey)
  const canMute = !!pubkey && event.pubkey !== pubkey
  const canDelete = !!pubkey && event.pubkey === pubkey && event.kind !== Kind.EventDeletion

  const { mutateAsync: requestDelete } = usePublishEventMutation<{ target: NostrEventDB }>({
    mutationFn:
      ({ signer, pubkey }) =>
        ({ target }) =>
          publishDeleteRequest(pubkey, target, { signer }),
  })

  const handleCopy = useCallback((value: string | undefined) => {
    return (e: StrictClickEvent) => {
      e.stopPropagation()
      e.preventDefault()
      if (!value) return
      const type = 'text/plain'
      const blob = new Blob([value], { type })
      window.navigator.clipboard.write([new ClipboardItem({ [type]: blob })]).then(() => {
        enqueueToast({ component: 'Copied', duration: 4000 })
      })
    }
  }, [])

  return (
    <MenuList surface='surfaceContainerLow' sx={styles.menuList}>
      <Options
        event={event}
        nevent={nevent}
        canMute={canMute}
        canDelete={canDelete}
        onCopyIdClick={handleCopy(nevent)}
        onCopyAuthorIdClick={handleCopy(user?.nprofile)}
        onCopyLinkClick={handleCopy(link)}
        onBookmarkClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          if (pubkey) {
            onOpenBookmark()
            onClose()
          }
        }}
        onDetailsClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          setStatsDialog(event.id)
          onClose()
        }}
        onRequestDeleteClick={async (e) => {
          e.stopPropagation()
          e.preventDefault()
          await requestDelete({ target: event })
          onClose()
        }}
        onMuteClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          onOpenMute({ pubkey: event.pubkey })
          onClose()
        }}
        onMuteNoteClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          onOpenMute({ pubkey: event.pubkey, eventId: event.id })
          onClose()
        }}
      />
    </MenuList>
  )
})

type Props = {
  event: NostrEventDB
}

export const PostOptions = memo(function PostOptions(props: Props) {
  const { event } = props
  const { dense } = useContentContext()
  const [bookmarkDialogOpen, setBookmarkDialogOpen] = useState(false)
  const [muteDialogOpen, setMuteDialogOpen] = useState(false)
  const [muteDialogTarget, setMuteDialogTarget] = useState<{ pubkey: string; eventId?: string } | null>(null)

  return (
    <>
      <Popover
        sx={styles.menu}
        placement='bottom-end'
        contentRenderer={(popover) => (
          <PostOptionsContent
            event={event}
            onClose={popover.close}
            onOpenBookmark={() => setBookmarkDialogOpen(true)}
            onOpenMute={(target) => {
              setMuteDialogTarget(target)
              setMuteDialogOpen(true)
            }}
          />
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
      <Suspense fallback={null}>
        <PostBookmarkOptions open={bookmarkDialogOpen} postId={event.id} onClose={() => setBookmarkDialogOpen(false)} />
      </Suspense>
      <Suspense fallback={null}>
        <ListMuteOptionsDialog
          open={muteDialogOpen}
          targetPubkey={muteDialogTarget?.pubkey}
          targetEventId={muteDialogTarget?.eventId}
          onClose={() => setMuteDialogOpen(false)}
        />
      </Suspense>
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
