import type { FeedState } from '@/hooks/state/useFeed'
import { memo } from 'react'
import { FeedReplyTabs } from '../FeedReplyTabs'
import { FeedHeaderBase } from './FeedHeaderBase'

type Props = {
  feed: FeedState
}

export const FeedHeaderRelayFeed = memo(function FeedHeaderRelayFeed(props: Props) {
  const { feed } = props
  return (
    <FeedHeaderBase
      feed={feed}
      leading={
        <FeedReplyTabs
          feed={feed}
          onChange={(tab) => {
            feed.setReplies(tab === 'replies')
            feed.setPageSize(feed.options.pageSize || 10)
          }}
        />
      }
    />
  )
})
