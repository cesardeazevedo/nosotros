import { useDeckAddNextColumn } from '@/components/modules/Deck/hooks/useDeck'
import { createEventModule } from '@/hooks/modules/createEventModule'
import type { NoteState } from '@/hooks/state/useNote'
import { useIsCurrentRouteEventID } from '@/hooks/useNavigations'
import { useNostrMaskedLinkProps } from '@/hooks/useNostrMaskedLinkProps'
import { useNavigate, useRouter } from '@tanstack/react-router'
import React, { memo, useCallback, type ReactNode } from 'react'
import { css, html } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'

type Props = {
  note: NoteState
  children: ReactNode
  onClick?: () => void
}

export const PostLink = memo(function PostLink(props: Props) {
  const { note, children } = props
  const router = useRouter()
  const navigate = useNavigate()
  const linkProps = useNostrMaskedLinkProps(note.nip19)
  const deck = useDeckAddNextColumn(() => createEventModule(note.nip19))
  const isActive = useIsCurrentRouteEventID(note.event.id)

  const handleClick = useCallback(
    (e: StrictClickEvent) => {
      if (deck.isDeck) {
        return deck.add(e as React.MouseEvent<HTMLElement>)
      }

      if (e.metaKey) {
        const { href } = router.buildLocation(linkProps)
        window.open(href, '_blank', 'noopener, noreferrer')
        return
      }
      navigate({
        ...linkProps,
        state: { from: router.latestLocation.pathname } as never,
      })
    },
    [note, deck, linkProps],
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
      ':hover:not(:has(button:hover, img:hover))': 'rgba(125, 125, 125, 0.06)',
    },
  },
})
