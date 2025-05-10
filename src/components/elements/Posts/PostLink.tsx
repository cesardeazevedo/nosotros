import { useMobile } from '@/hooks/useMobile'
import type { Note } from '@/stores/notes/note'
import { useMatch, useNavigate, useRouter } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import type { NAddr, NEvent } from 'nostr-tools/nip19'
import { useCallback, useRef, type ReactNode } from 'react'
import { css, html } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'

type Props = {
  note: Note
  children: ReactNode
  onClick?: () => void
}

export const PostLink = observer(function postList(props: Props) {
  const { note, children, onClick } = props
  const ref = useRef<HTMLDivElement>(null)
  const context = useMatch({ from: '/$nostr', shouldThrow: false })?.context
  const mobile = useMobile()
  const router = useRouter()
  const navigate = useNavigate()
  const isCurrentNote = context?.decoded?.type === 'nevent' ? context?.decoded.data.id === note.id : false
  const isActive = isCurrentNote || note.repliesOpen === true

  const handleClick = useCallback(
    (e: StrictClickEvent) => {
      const element = 'target' in e ? (e.target as HTMLElement) : null
      const isLink = !!element?.closest('a')
      const isButton = !!element?.closest('button')
      if (isButton || isLink) {
        return
      }
      if (!mobile) {
        note.toggleContent(true)
        onClick?.()
      } else {
        navigate({
          to: '/$nostr',
          params: { nostr: note.event.isAddressable ? (note.event.naddress as NAddr) : (note.event.nevent as NEvent) },
          state: { from: router.latestLocation.pathname } as never,
        })
      }
    },
    [note],
  )

  return (
    <html.div ref={ref} onClick={!isActive ? handleClick : undefined} style={[styles.root, !isActive && styles.action]}>
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
      ':hover': 'rgba(125, 125, 125, 0.03)',
    },
  },
})
