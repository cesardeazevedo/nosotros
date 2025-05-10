import type { FeedModule } from '@/stores/modules/feed.module'
import { DeckColumnFeed } from '../Deck/DeckColumnFeed'
import { FeedHeaderBase } from '../Feed/headers/FeedHeaderBase'
import { TagHeader } from './TagHeader'

type Props = {
  module: FeedModule
}

export const TagColumn = (props: Props) => {
  const { module } = props
  return (
    <DeckColumnFeed
      feed={module.feed}
      header={<FeedHeaderBase feed={module.feed} renderRelaySettings leading={<TagHeader module={module} />} />}
    />
  )
}
