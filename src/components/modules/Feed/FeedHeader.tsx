import { Kind } from '@/constants/kinds'
import type { FeedState } from '@/hooks/state/useFeed'
import { FeedHeaderBase } from './headers/FeedHeaderBase'
import { FeedHeaderFollowSet } from './headers/FeedHeaderFollowSet'
import { FeedHeaderRelayFeed } from './headers/FeedHeaderRelayFeed'
import { FeedHeaderRelaySets } from './headers/FeedHeaderRelaySets'
import { FeedHeaderReposts } from './headers/FeedHeaderReposts'

type Props = {
  feed: FeedState
}

export const FeedHeader = (props: Props) => {
  const { feed } = props
  switch (feed.options.type) {
    case 'quotes': {
      return <FeedHeaderReposts selected='quotes' />
    }
    case 'reposts': {
      return <FeedHeaderReposts selected='reposts' />
    }
    case 'relayfeed': {
      return <FeedHeaderRelayFeed feed={feed} />
    }
    case 'starterpack':
    case 'followset': {
      return <FeedHeaderFollowSet feed={feed} />
    }
    case 'relaysets': {
      return <FeedHeaderRelaySets feed={feed} />
    }
    case 'lists': {
      switch (feed.filter.kinds?.[0]) {
        case Kind.BookmarkList: {
          return <FeedHeaderBase label='Bookmarks' />
        }
        case Kind.FollowSets: {
          return <FeedHeaderBase label='Follow Sets' feed={feed} />
        }
        case Kind.RelaySets: {
          return <FeedHeaderBase label='Relay Sets' feed={feed} />
        }
        default: {
          return <FeedHeaderBase label='Feed' feed={feed} />
        }
      }
    }
    default: {
      return <FeedHeaderBase label='Feed' feed={feed} />
    }
  }
}
