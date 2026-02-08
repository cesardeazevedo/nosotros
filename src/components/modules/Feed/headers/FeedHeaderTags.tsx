import type { FeedState } from '@/hooks/state/useFeed'
import { TagHeader } from '@/components/modules/Tag/TagHeader'
import { FeedHeaderBase } from './FeedHeaderBase'

type Props = {
  feed: FeedState
}

export const FeedHeaderTags = (props: Props) => {
  return <FeedHeaderBase feed={props.feed} renderRelaySettings leading={<TagHeader feed={props.feed} />} />
}
