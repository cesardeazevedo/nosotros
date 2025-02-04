import { useMobile } from '@/hooks/useMobile'
import { subscribeNoteStats } from '@/nostr/subscriptions/subscribeNoteStats'
import { useNostrClientContext } from '@/stores/context/nostr.context.hooks'
import type { Note } from '@/stores/notes/note'
import { useMatch } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { useCallback, useRef, type ReactNode } from 'react'
import { css, html } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'
import { LinkNAddress } from '../Links/LinkNAddress'
import { LinkNEvent } from '../Links/LinkNEvent'

type Props = {
  note: Note
  children: ReactNode
  onClick?: () => void
}

export const PostLink = observer(function postList(props: Props) {
  const { note, children } = props
  const ref = useRef<HTMLDivElement>(null)
  const context = useMatch({ from: '/$nostr', shouldThrow: false })?.context
  const { client } = useNostrClientContext()
  const isCurrentNote = context?.decoded?.type === 'nevent' ? context?.decoded.data.id === note.id : false
  const isActive = isCurrentNote || note.repliesOpen === true

  const handleClick = useCallback(
    (e: StrictClickEvent) => {
      e.preventDefault()
      e.stopPropagation()
      note.toggleContent(true)
      note.toggleReplies(true)
      note.setRepliesStatus('LOADING')
      subscribeNoteStats(client, note.event.event, {}).subscribe({
        complete: () => {
          note.setRepliesStatus('LOADED')
        },
      })
    },
    [note],
  )

  const mobile = useMobile()
  if (mobile && !isCurrentNote) {
    if (note.event.isAddressable) {
      return <LinkNAddress naddress={note.event.naddress}>{children}</LinkNAddress>
    } else {
      return <LinkNEvent nevent={note.event.nevent}>{children}</LinkNEvent>
    }
  } else {
    return (
      <html.div
        ref={ref}
        onClick={!isActive ? handleClick : undefined}
        style={[styles.root, !isActive && styles.action]}>
        {children}
      </html.div>
    )
  }
})

const styles = css.create({
  root: {
    scrollMarginTop: 64,
  },
  action: {
    cursor: 'pointer',
    backgroundColor: {
      default: 'transparent',
      ':hover': 'rgba(125, 125, 125, 0.03)',
    },
  },
})
