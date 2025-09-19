import type { FeedModule } from '@/hooks/query/useQueryFeeds'
import { useFeedState } from '@/hooks/state/useFeed'
import { memo } from 'react'
import { DeckColumnFeed } from '../Deck/DeckColumnFeed'
import { FeedHeaderBase } from '../Feed/headers/FeedHeaderBase'
import { TagHeader } from './TagHeader'

type Props = {
  module: FeedModule
}

export const TagColumn = memo(function TagColumn(props: Props) {
  const { module } = props
  const feed = useFeedState(module)
  return (
    <DeckColumnFeed
      feed={feed}
      header={<FeedHeaderBase feed={feed} renderRelaySettings leading={<TagHeader feed={feed} />} />}
    />
  )
})
