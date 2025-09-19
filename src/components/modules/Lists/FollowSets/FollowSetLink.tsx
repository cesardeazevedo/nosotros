import type { SxProps } from '@/components/ui/types'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { createListFeedModule } from '@/hooks/modules/createListFeedModule'
import { useEventTag } from '@/hooks/useEventUtils'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { memo, useMemo } from 'react'
import { css, html } from 'react-strict-dom'
import { useDeckAddNextColumn } from '../../Deck/hooks/useDeck'

type Props = {
  event: NostrEventDB
  onClick?: () => void
  sx?: SxProps
  children: ReactNode
}

export const FollowSetLink = memo(function FollowSetLink(props: Props) {
  const { event, children, onClick, sx, ...rest } = props
  const d = useEventTag(event, 'd') || ''
  const module = useMemo(() => createListFeedModule(event), [event])
  const deck = useDeckAddNextColumn(() => module)

  if (deck.isDeck) {
    return (
      <html.a href='' onClick={deck.add} style={sx}>
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
        kind: module.filter.kinds,
        limit: module.filter.limit,
      }}
      disabled={!!onClick}
      {...css.props(sx)}
      {...rest}>
      {children}
    </Link>
  )
})
