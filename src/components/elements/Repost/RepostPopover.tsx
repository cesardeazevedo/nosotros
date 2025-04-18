import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { Popover } from '@/components/ui/Popover/Popover'
import type { IPopoverBaseTriggerRendererProps } from '@/components/ui/Popover/PopoverBase.types'
import { Kind } from '@/constants/kinds'
import { useCurrentAccount } from '@/hooks/useRootStore'
import { publishRepost } from '@/nostr/publish/publishRepost'
import type { Account } from '@/stores/auth/account.store'
import type { Note } from '@/stores/notes/note'
import { toastStore } from '@/stores/ui/toast.store'
import { spacing } from '@/themes/spacing.stylex'
import { IconBlockquote, IconShare3 } from '@tabler/icons-react'
import { useRouter } from '@tanstack/react-router'
import { useObservableState } from 'observable-hooks'
import React from 'react'
import { css } from 'react-strict-dom'
import { EMPTY, endWith, map, mergeMap, startWith, tap } from 'rxjs'
import { LinkBase } from '../Links/LinkBase'
import { ToastEventPublished } from '../Toasts/ToastEventPublished'

type Props = {
  open?: boolean
  note: Note
  onClose?: () => void
  children: (props: IPopoverBaseTriggerRendererProps) => React.ReactNode
}

export const RepostPopover = (props: Props) => {
  const { note, children } = props
  const router = useRouter()
  const acc = useCurrentAccount()

  const [isReposting, submit] = useObservableState<boolean, [Note, Account]>((input$) => {
    return input$.pipe(
      mergeMap(([note, acc]) => {
        if (!acc.signer) return EMPTY
        return publishRepost(acc.pubkey, note.event.event, { signer: acc.signer.signer }).pipe(
          tap((event) => {
            toastStore.enqueue(<ToastEventPublished event={event} eventLabel='Repost' />, { duration: 10_000_000 })
          }),
          map(() => false),
          startWith(true),
          endWith(false),
        )
      }),
      startWith(false),
      endWith(false),
    )
  }, false)

  return (
    <Popover
      sx={styles.root}
      placement='bottom-start'
      contentRenderer={({ close }) => (
        <MenuList sx={styles.menu} surface='surfaceContainerLow'>
          {note.event.event.kind === Kind.Text && (
            <MenuItem
              disabled={isReposting}
              leadingIcon={<IconShare3 size={20} />}
              label={isReposting ? `Reposting...` : 'Repost'}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (acc) {
                  submit([note, acc])
                }
              }}
            />
          )}
          <LinkBase
            search={{ quoting: note.event.isAddressable ? note.event.naddress : note.event.nevent }}
            state={{ from: router.latestLocation.pathname } as never}>
            <MenuItem leadingIcon={<IconBlockquote strokeWidth='1.5' />} label='Quote' onClick={() => close()} />
          </LinkBase>
        </MenuList>
      )}>
      {children}
    </Popover>
  )
}

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
