import { RelayChip } from '@/components/elements/Relays/RelayChip'
import type { FeedState } from '@/hooks/state/useFeed'
import { memo } from 'react'
import { FeedHeaderBase } from './FeedHeaderBase'

type Props = {
  feed: FeedState
}

export const FeedHeaderRelayFeed = memo(function FeedHeaderRelayFeed(props: Props) {
  const { feed } = props
  return (
    <FeedHeaderBase leading={feed.options.ctx.relays && <RelayChip url={feed.options.ctx.relays?.[0]} />} feed={feed} />
  )
})
