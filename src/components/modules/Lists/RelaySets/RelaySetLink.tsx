import type { SxProps } from '@/components/ui/types'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { createListFeedModule } from '@/hooks/modules/createListFeedModule'
import type { FeedModule } from '@/hooks/query/useQueryFeeds'
import { useEventTag } from '@/hooks/useEventUtils'
import type { LinkProps } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { css, html } from 'react-strict-dom'
import { useDeckAddNextColumn } from '../../Deck/hooks/useDeck'

type Props = LinkProps & {
  event: NostrEventDB
  sx?: SxProps
  onClick?: (feed: FeedModule) => void
  children: ReactNode
}

export const RelaySetLink = (props: Props) => {
  const { event, onClick, sx, children, ...rest } = props
  const d = useEventTag(event, 'd')
  const relaySets = [event.pubkey, d].join(':')
  const deck = useDeckAddNextColumn(() => createListFeedModule(event, 'relay_sets'))

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
        relaySets,
        limit: 30,
        kind: [Kind.Text, Kind.Repost],
        type: 'relaysets',
      }}
      {...css.props(sx)}
      disabled={!!onClick}
      {...rest}>
      {children}
    </Link>
  )
}
