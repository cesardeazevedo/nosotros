import type { ReactNode } from 'react'
import { RelayChip } from '@/components/elements/Relays/RelayChip'
import type { FeedState } from '@/hooks/state/useFeed'
import { memo } from 'react'
import { Stack } from '@/components/ui/Stack/Stack'
import { FeedReplyTabs } from '../FeedReplyTabs'
import { FeedHeaderBase } from './FeedHeaderBase'

type Props = {
  feed: FeedState
  leadingPrefix?: ReactNode
}

export const FeedHeaderRelayFeed = memo(function FeedHeaderRelayFeed(props: Props) {
  const { feed, leadingPrefix } = props
  const relay = feed.options.ctx.relays?.[0]
  return (
    <FeedHeaderBase
      feed={feed}
      leadingPrefix={leadingPrefix}
      leading={relay ? <RelayChip url={relay} /> : 'Feed'}
      middle={
        <Stack>
          <FeedReplyTabs
            feed={feed}
            onChange={(tab) => {
              feed.setReplies(tab === 'replies')
              feed.setPageSize(feed.options.pageSize || 10)
            }}
          />
        </Stack>
      }
    />
  )
})
