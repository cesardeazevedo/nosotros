import { enqueueToastAtom } from '@/atoms/toaster.atoms'
import { useNostrContext } from '@/components/providers/NostrContextProvider'
import { useNoteContext } from '@/components/providers/NoteProvider'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { Popover } from '@/components/ui/Popover/Popover'
import type { IPopoverBaseTriggerRendererProps } from '@/components/ui/Popover/PopoverBase.types'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { usePublishEventMutation } from '@/hooks/mutations/usePublishEventMutation'
import { queryKeys } from '@/hooks/query/queryKeys'
import { useNIP19 } from '@/hooks/useEventUtils'
import { publishRepost } from '@/nostr/publish/publishRepost'
import { spacing } from '@/themes/spacing.stylex'
import { IconBlockquote, IconShare3 } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import type { NostrEvent } from 'nostr-tools'
import React, { memo } from 'react'
import { css } from 'react-strict-dom'
import { LinkBase } from '../Links/LinkBase'
import { ToastEventPublished } from '../Toasts/ToastEventPublished'

type Props = {
  open?: boolean
  onClose?: () => void
  children: (props: IPopoverBaseTriggerRendererProps) => React.ReactNode
}

export const RepostPopover = memo(function RepostPopover(props: Props) {
  const { children } = props
  const { event } = useNoteContext()
  const ctx = useNostrContext()
  const router = useRouter()
  const queryClient = useQueryClient()
  const enqueueToast = useSetAtom(enqueueToastAtom)
  const nip19 = useNIP19(event)

  const { isPending, mutate } = usePublishEventMutation<NostrEvent>({
    mutationFn:
      ({ signer }) =>
      (event) =>
        publishRepost(event, { signer, includeRelays: ctx?.relays }),
    onSuccess: (event) => {
      queryClient.setQueryData(queryKeys.tag('e', [event.id], Kind.Repost), (old: NostrEventDB[] = []) => {
        return [...old, event]
      })
      enqueueToast({ component: <ToastEventPublished event={event} eventLabel='Repost' />, duration: 5_000_000 })
    },
  })

  return (
    <Popover
      sx={styles.root}
      placement='bottom-start'
      contentRenderer={({ close }) => (
        <MenuList sx={styles.menu} surface='surfaceContainerLow'>
          {event.kind === Kind.Text && (
            <MenuItem
              disabled={isPending}
              leadingIcon={<IconShare3 size={20} />}
              label={isPending ? 'Reposting...' : 'Repost'}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                const { metadata, ...rest } = event
                mutate(rest)
              }}
            />
          )}
          <LinkBase
            search={(rest) => ({ ...rest, quoting: nip19 })}
            state={{ from: router.latestLocation.pathname } as never}>
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
