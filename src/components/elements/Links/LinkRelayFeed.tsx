import { useDeckAddNextColumn } from '@/components/modules/Deck/hooks/useDeck'
import type { SxProps } from '@/components/ui/types'
import { Kind } from '@/constants/kinds'
import { createRelayFeedModule } from '@/hooks/modules/createRelayFeedModule'
import type { LinkProps } from '@tanstack/react-router'
import { Link, useRouter } from '@tanstack/react-router'
import React, { memo } from 'react'
import { css, html } from 'react-strict-dom'

type Props = Omit<LinkProps, 'to' | 'search'> & {
  url: string
  children: React.ReactNode
  sx?: SxProps
}

export const LinkRelayFeed = memo(function LinkRelayFeed(props: Props) {
  const { url, target = '_self', sx } = props
  const router = useRouter()
  const deck = useDeckAddNextColumn(() => createRelayFeedModule(url))

  if (deck.isDeck) {
    return (
      <html.a {...css.props(sx)} onClick={deck.add}>
        {props.children}
      </html.a>
    )
  }

  return (
    <Link
      to={`/feed`}
      target={target}
      search={{ relay: url, kind: Kind.Text, limit: 30, type: 'relayfeed' }}
      state={{ from: router.latestLocation.pathname } as never}
      {...css.props(sx)}>
      {props.children}
    </Link>
  )
})
