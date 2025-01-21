import { useNoteContext } from '@/components/providers/NoteProvider'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { PopoverBase } from '@/components/ui/Popover/PopoverBase'
import type { IPopoverBaseTriggerRendererProps } from '@/components/ui/Popover/PopoverBase.types'
import { useRootContext } from '@/hooks/useRootStore'
import { publishRepost } from '@/nostr/publish/publishRepost'
import type { Note } from '@/stores/notes/note'
import { toastStore } from '@/stores/ui/toast.store'
import { spacing } from '@/themes/spacing.stylex'
import { IconBlockquote, IconShare3 } from '@tabler/icons-react'
import { useRouter } from '@tanstack/react-router'
import { useObservableState } from 'observable-hooks'
import React, { useCallback, useState } from 'react'
import { css } from 'react-strict-dom'
import { endWith, map, mergeMap, startWith, tap } from 'rxjs'
import { LinkBase } from '../Links/LinkBase'
import { ToastEventPublished } from '../Toasts/ToastEventPublished'

type Props = {
  open?: boolean
  note: Note
  onClose?: () => void
  children: (props: IPopoverBaseTriggerRendererProps & { open: boolean; handleOpen: () => void }) => React.ReactNode
}

export const RepostPopover = (props: Props) => {
  const { note, children } = props
  const router = useRouter()
  const context = useRootContext()
  const { disableLink } = useNoteContext()
  const [open, setOpen] = useState(false)

  const [isReposting, submit] = useObservableState<boolean, void>((input$) => {
    return input$.pipe(
      mergeMap(() => {
        return publishRepost(context.client, note.event).pipe(
          tap((event) => {
            toastStore.enqueue(<ToastEventPublished event={event} eventLabel='Repost' />, { duration: 10000_000 })
          }),
          map(() => false),
          tap(() => handleClose()),
          startWith(true),
          endWith(false),
        )
      }),
      startWith(false),
      endWith(false),
    )
  }, false)

  const handleOpen = useCallback(() => {
    setOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  return (
    <PopoverBase
      opened={open}
      onClose={handleClose}
      sx={styles.root}
      placement='bottom-start'
      contentRenderer={() => (
        <MenuList sx={styles.menu} surface='surfaceContainerLow'>
          <MenuItem
            disabled={isReposting}
            leadingIcon={<IconShare3 size={20} />}
            label={isReposting ? `Reposting...` : 'Repost'}
            onClick={() => submit()}
          />
          <LinkBase
            disabled={disableLink}
            search={{ quoting: note.isAddressable ? note.naddress : note.nevent }}
            // @ts-ignore
            state={{ from: router.latestLocation.pathname }}>
            <MenuItem leadingIcon={<IconBlockquote strokeWidth='1.5' />} label='Quote' onClick={handleClose} />
          </LinkBase>
        </MenuList>
      )}>
      {(props) => children({ ...props, open, handleOpen })}
    </PopoverBase>
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
