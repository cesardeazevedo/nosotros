import type { FeedModule } from '@/stores/modules/feed.module'
import { DeckColumnFeed } from '../Deck/DeckColumnFeed'
import { TagHeader } from './TagHeader'

type Props = {
  module: FeedModule
}

export const TagColumn = (props: Props) => {
  const { module } = props
  return <DeckColumnFeed id={module.id} feed={module.feed} leading={<TagHeader module={module} />} />
}
