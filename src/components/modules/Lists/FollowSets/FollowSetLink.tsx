import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { createListFeedModule } from '@/hooks/modules/createListFeedModule'
import { useEventTag } from '@/hooks/useEventUtils'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { memo } from 'react'
import { html } from 'react-strict-dom'
import { useDeckAddNextColumn } from '../../Deck/hooks/useDeck'

type Props = {
  event: NostrEventDB
  onClick?: () => void
  children: ReactNode
}

export const FollowSetLink = memo(function FollowSetLink(props: Props) {
  const { event, children, onClick, ...rest } = props
  const kinds = [Kind.FollowSets, Kind.Text, Kind.Repost]
  const d = useEventTag(event, 'd') || ''
  const deck = useDeckAddNextColumn(() => createListFeedModule(event))

  if (deck.isDeck) {
    return (
      <html.a href='' onClick={deck.add}>
        {children}
      </html.a>
    )
  }

  return (
    <Link
      to='/feed'
      search={{
        scope: 'sets_p',
        author: event.pubkey,
        d,
        type: 'followset',
        kind: kinds,
        limit: 20,
      }}
      disabled={!!onClick}
      {...rest}>
      {children}
    </Link>
  )
})
