import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { createListFeedModule } from '@/hooks/modules/createListFeedModule'
import { useEventTag } from '@/hooks/useEventUtils'
import type { LinkProps } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { useMemo, type ReactNode } from 'react'
import { html } from 'react-strict-dom'
import { useDeckAddNextColumn } from '../../Deck/hooks/useDeck'

type Props = LinkProps & {
  event: NostrEventDB
  onClick?: () => void
  children: ReactNode
}

export const StarterPackLink = (props: Props) => {
  const { event, onClick, children, ...rest } = props
  const d = useEventTag(event, 'd') || ''
  const module = useMemo(() => createListFeedModule(event), [event])
  const deck = useDeckAddNextColumn(() => module)

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
        kind: module.filter.kinds,
        limit: module.filter.limit,
        type: 'starterpack',
        author: [event.pubkey],
        d,
      }}
      {...rest}
      disabled={!!onClick}>
      {children}
    </Link>
  )
}
