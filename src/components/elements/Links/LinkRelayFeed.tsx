import { useDeckAddNextColumn } from '@/components/modules/Deck/hooks/useDeck'
import type { SxProps } from '@/components/ui/types'
import { createRelayFeedModule } from '@/hooks/modules/createRelayFeedModule'
import type { LinkProps } from '@tanstack/react-router'
import { Link, useRouter } from '@tanstack/react-router'
import { memo, useMemo } from 'react'
import { css, html } from 'react-strict-dom'

type Props = Omit<LinkProps, 'to' | 'search'> & {
  url: string
  sx?: SxProps
  allowDeckLink?: boolean
  onClick?: () => void
}

export const LinkRelayFeed = memo(function LinkRelayFeed(props: Props) {
  const { url, target = '_self', sx, children, allowDeckLink = true, onClick } = props
  const router = useRouter()
  const module = useMemo(() => createRelayFeedModule(url), [url])
  const deck = useDeckAddNextColumn(() => module)

  if (deck.isDeck && allowDeckLink) {
    return (
      <html.a {...css.props(sx)} onClick={deck.add}>
        {typeof children === 'function' ? children({ isActive: false, isTransitioning: false }) : children}
      </html.a>
    )
  }

  return (
    <Link
      to={`/feed`}
      target={target}
      search={{ relay: url, kind: module.filter.kinds, limit: module.filter.limit, type: 'relayfeed' }}
      state={{ from: router.latestLocation.pathname } as never}
      onClick={onClick}
      {...css.props(sx)}>
      {props.children}
    </Link>
  )
})
