import type { SxProps } from '@/components/ui/types'
import { Kind } from '@/constants/kinds'
import { createBookmarkFeedModule } from '@/hooks/modules/createListFeedModule'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { memo, useMemo } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  pubkey?: string
  sx?: SxProps
  children: ReactNode
  onClick?: () => void
}

export const BookmarksLink = memo(function BookmarksLink(props: Props) {
  const { pubkey, children, onClick, sx, ...rest } = props
  const module = useMemo(() => createBookmarkFeedModule(pubkey || ''), [pubkey])

  if (!pubkey) {
    return children
  }

  return (
    <Link
      to='/feed'
      search={{
        kind: [Kind.BookmarkList],
        author: [pubkey],
        type: 'lists',
        live: false,
        scope: 'sets_e',
        limit: 50,
      }}
      disabled={!!onClick}
      {...css.props(sx)}
      {...rest}>
      {children}
    </Link>
  )
})
