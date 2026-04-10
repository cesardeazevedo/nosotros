import type { SxProps } from '@/components/ui/types'
import { Kind } from '@/constants/kinds'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { createListFeedModule } from '@/hooks/modules/createListFeedModule'
import type { FeedModule } from '@/hooks/query/useQueryFeeds'
import { Link } from '@tanstack/react-router'
import { memo, useMemo, type ReactNode } from 'react'
import { css, html } from 'react-strict-dom'
import { useDeckAddNextColumn } from '../Deck/hooks/useDeck'

type ListFeedType = 'lists' | 'followset' | 'relaysets' | 'starterpack'
type ListFeedScope = 'sets_p' | 'sets_e' | 'relay_sets'

type ListFeedSearch = {
  kind?: number[]
  author?: string[]
  limit?: number
  d?: string[]
  scope?: ListFeedScope
  type?: ListFeedType
  live?: boolean
}

type ListFeedConfig = {
  module: FeedModule
  search: ListFeedSearch
}

type Props = {
  event: NostrEventDB
  children: ReactNode
  sx?: SxProps
}

const isKindSupported = (kind: number) => {
  switch (kind) {
    case Kind.Mutelist:
    case Kind.PinnedNotes:
    case Kind.BookmarkList:
    case Kind.MediaFollows:
    case Kind.FollowSets:
    case Kind.RelaySets:
    case Kind.BookmarkSets:
    case Kind.StarterPack:
    case Kind.MediaStarterPack: {
      return true
    }
    default: {
      return false
    }
  }
}

const getScope = (kind: number): ListFeedScope => {
  switch (kind) {
    case Kind.PinnedNotes:
    case Kind.BookmarkList:
    case Kind.BookmarkSets: {
      return 'sets_e'
    }
    case Kind.RelaySets: {
      return 'relay_sets'
    }
    default: {
      return 'sets_p'
    }
  }
}

const getType = (kind: number): ListFeedType => {
  switch (kind) {
    case Kind.FollowSets: {
      return 'followset'
    }
    case Kind.RelaySets: {
      return 'relaysets'
    }
    case Kind.StarterPack:
    case Kind.MediaStarterPack: {
      return 'starterpack'
    }
    default: {
      return 'lists'
    }
  }
}

const getListFeedConfig = (event: NostrEventDB): ListFeedConfig | null => {
  if (!isKindSupported(event.kind)) {
    return null
  }

  const scope = getScope(event.kind)
  const type = getType(event.kind)
  const module = createListFeedModule(event, scope)
  module.type = type

  return {
    module,
    search: {
      kind: module.filter.kinds,
      author: module.filter.authors,
      limit: module.filter.limit,
      d: module.filter['#d'],
      scope,
      type,
      live: module.live,
    },
  }
}

export const ListFeedLink = memo(function ListFeedLink(props: Props) {
  const { event, children, sx } = props
  const config = useMemo(() => getListFeedConfig(event), [event])
  const deck = useDeckAddNextColumn(() => {
    return config?.module ?? createListFeedModule(event, 'sets_p')
  })

  if (!config) {
    return <>{children}</>
  }

  if (deck.isDeck) {
    return (
      <html.a href='' onClick={deck.add} {...css.props(sx)}>
        {children}
      </html.a>
    )
  }

  return (
    <Link to='/feed' search={config.search} {...css.props(sx)}>
      {children}
    </Link>
  )
})
