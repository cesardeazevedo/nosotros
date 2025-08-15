import { enqueueToastAtom } from '@/atoms/toaster.atoms'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { Popover } from '@/components/ui/Popover/Popover'
import type { IPopoverBaseTriggerRendererProps } from '@/components/ui/Popover/PopoverBase.types'
import { Kind } from '@/constants/kinds'
import { usePublishEventMutation } from '@/hooks/mutations/usePublishEventMutation'
import type { NoteState } from '@/hooks/state/useNote'
import { dbSqlite } from '@/nostr/db'
import { publishRepost } from '@/nostr/publish/publishRepost'
import { spacing } from '@/themes/spacing.stylex'
import { IconBlockquote, IconShare3 } from '@tabler/icons-react'
import { useRouter } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import type { NostrEvent } from 'nostr-tools'
import React, { memo } from 'react'
import { css } from 'react-strict-dom'
import { LinkBase } from '../Links/LinkBase'
import { ToastEventPublished } from '../Toasts/ToastEventPublished'

type Props = {
  open?: boolean
  note: NoteState
  onClose?: () => void
  children: (props: IPopoverBaseTriggerRendererProps) => React.ReactNode
}

export const RepostPopover = memo(function RepostPopover(props: Props) {
  const { note, children } = props
  const router = useRouter()
  const enqueueToast = useSetAtom(enqueueToastAtom)

  const { isPending, mutate } = usePublishEventMutation<NostrEvent>({
    mutationFn:
      ({ signer }) =>
      (event) =>
        publishRepost(event, { signer }),
    onSuccess: (event) => {
      enqueueToast({ component: <ToastEventPublished event={event} eventLabel='Repost' />, duration: 5_000_000 })
    },
  })

  return (
    <Popover
      sx={styles.root}
      placement='bottom-start'
      contentRenderer={({ close }) => (
        <MenuList sx={styles.menu} surface='surfaceContainerLow'>
          {note.event.kind === Kind.Text && (
            <MenuItem
              disabled={isPending}
              leadingIcon={<IconShare3 size={20} />}
              label={isPending ? 'Reposting...' : 'Repost'}
              onClick={async (e) => {
                e.preventDefault()
                e.stopPropagation()
                const event = await dbSqlite.getRawEventById(note.event.id)
                mutate(event)
              }}
            />
          )}
          <LinkBase search={{ quoting: note.nip19 }} state={{ from: router.latestLocation.pathname } as never}>
            <MenuItem leadingIcon={<IconBlockquote strokeWidth='1.5' />} label='Quote' onClick={() => close()} />
          </LinkBase>
        </MenuList>
      )}>
      {children}
    </Popover>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
    zIndex: 400,
  },
  menu: {
    right: spacing.margin2,
    width: 180,
  },
})
