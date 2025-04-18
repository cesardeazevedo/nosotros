import { RelayChip } from '@/components/elements/Relays/RelayChip'
import type { FeedStore } from '@/stores/feeds/feed.store'
import { observer } from 'mobx-react-lite'
import { FeedHeaderBase } from './FeedHeaderBase'

type Props = {
  feed: FeedStore
}

export const FeedHeaderRelayFeed = observer(function FeedHeaderRelayFeed(props: Props) {
  const { feed } = props
  return <FeedHeaderBase leading={feed.context.relays && <RelayChip url={feed.context.relays?.[0]} />} feed={feed} />
})
