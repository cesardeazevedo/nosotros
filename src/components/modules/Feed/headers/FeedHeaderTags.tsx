import type { ReactNode } from 'react'
import type { FeedState } from '@/hooks/state/useFeed'
import { TagHeader } from '@/components/modules/Tag/TagHeader'
import { FeedHeaderBase } from './FeedHeaderBase'

type Props = {
  feed: FeedState
  leadingPrefix?: ReactNode
}

export const FeedHeaderTags = (props: Props) => {
  return <FeedHeaderBase feed={props.feed} renderRelaySettings leading={<TagHeader feed={props.feed} />} leadingPrefix={props.leadingPrefix} />
}
