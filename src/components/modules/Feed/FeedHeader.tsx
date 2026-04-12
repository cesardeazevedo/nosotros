import type { ReactNode } from 'react'
import { Kind } from '@/constants/kinds'
import type { FeedState } from '@/hooks/state/useFeed'
import { FeedHeaderBase } from './headers/FeedHeaderBase'
import { FeedHeaderFollowSet } from './headers/FeedHeaderFollowSet'
import { FeedHeaderRelayFeed } from './headers/FeedHeaderRelayFeed'
import { FeedHeaderRelaySets } from './headers/FeedHeaderRelaySets'
import { FeedHeaderReposts } from './headers/FeedHeaderReposts'
import { FeedHeaderTags } from './headers/FeedHeaderTags'

type Props = {
  feed: FeedState
  leadingPrefix?: ReactNode
}

export const FeedHeader = (props: Props) => {
  const { feed, leadingPrefix } = props
  switch (feed.options.type) {
    case 'quotes': {
      return <FeedHeaderReposts selected='quotes' leadingPrefix={leadingPrefix} />
    }
    case 'reposts': {
      return <FeedHeaderReposts selected='reposts' leadingPrefix={leadingPrefix} />
    }
    case 'relayfeed': {
      return <FeedHeaderRelayFeed feed={feed} leadingPrefix={leadingPrefix} />
    }
    case 'starterpack':
    case 'followset': {
      return <FeedHeaderFollowSet feed={feed} leadingPrefix={leadingPrefix} />
    }
    case 'relaysets': {
      return <FeedHeaderRelaySets feed={feed} leadingPrefix={leadingPrefix} />
    }
    case 'tags': {
      return <FeedHeaderTags feed={feed} leadingPrefix={leadingPrefix} />
    }
    case 'lists': {
      switch (feed.filter.kinds?.[0]) {
        case Kind.BookmarkList: {
          return <FeedHeaderBase leading='Bookmarks' leadingPrefix={leadingPrefix} />
        }
        case Kind.FollowSets: {
          return <FeedHeaderBase leading='Follow Sets' feed={feed} leadingPrefix={leadingPrefix} />
        }
        case Kind.RelaySets: {
          return <FeedHeaderBase leading='Relay Sets' feed={feed} leadingPrefix={leadingPrefix} />
        }
        default: {
          return <FeedHeaderBase leading='Feed' feed={feed} leadingPrefix={leadingPrefix} />
        }
      }
    }
    default: {
      return <FeedHeaderBase leading='Feed' feed={feed} leadingPrefix={leadingPrefix} />
    }
  }
}
