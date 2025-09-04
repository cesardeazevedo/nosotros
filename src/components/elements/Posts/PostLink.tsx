import { useDeckAddNextColumn } from '@/components/modules/Deck/hooks/useDeck'
import { createEventModule } from '@/hooks/modules/createEventModule'
import type { NoteState } from '@/hooks/state/useNote'
import { useMobile } from '@/hooks/useMobile'
import { useMatch, useNavigate, useRouter } from '@tanstack/react-router'
import { memo, useCallback, type ReactNode } from 'react'
import { css, html } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'

type Props = {
  note: NoteState
  children: ReactNode
  onClick?: () => void
}

export const PostLink = memo(function postList(props: Props) {
  const { note, children, onClick } = props
  const context = useMatch({ from: '/$nostr', shouldThrow: false })?.context
  const mobile = useMobile()
  const router = useRouter()
  const navigate = useNavigate()
  const deck = useDeckAddNextColumn(() => createEventModule(note.nip19))
  const isCurrentNote = context?.decoded?.type === 'nevent' ? context?.decoded.data.id === note.id : false
  const isActive = isCurrentNote || note.state.repliesOpen === true

  const handleClick = useCallback(
    (e: StrictClickEvent) => {
      if (deck.isDeck) {
        return deck.add(e)
      }
      const element = 'target' in e ? (e.target as HTMLElement) : null
      const isLink = !!element?.closest('a')
      const isButton = !!element?.closest('button')
      if (isButton || isLink) {
        e.preventDefault()
        e.stopPropagation()
        return
      }
      if (!mobile) {
        note.actions.toggleContent(true)
        onClick?.()
      } else {
        navigate({
          to: '/$nostr',
          params: { nostr: note.nip19 as string },
          state: { from: router.latestLocation.pathname } as never,
        })
      }
    },
    [note, deck],
  )

  return (
    <html.div onClick={!isActive ? handleClick : undefined} style={[styles.root, !isActive && styles.action]}>
      {children}
    </html.div>
  )
})

const styles = css.create({
  root: {
    scrollMarginTop: 64,
  },
  action: {
    cursor: 'pointer',
    backgroundColor: {
      default: 'transparent',
      ':hover': 'rgba(125, 125, 125, 0.04)',
    },
  },
})
