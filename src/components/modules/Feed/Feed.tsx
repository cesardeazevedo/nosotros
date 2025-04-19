import { NostrEventFeedItem } from '@/components/elements/Event/NostrEventFeedItem'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import type { Props as ListProps } from '@/components/modules/Feed/FeedList'
import { FeedList } from '@/components/modules/Feed/FeedList'
import { ContentProvider } from '@/components/providers/ContentProvider'
import type { NostrEventMetadata } from '@/nostr/types'
import type { FeedStore } from '@/stores/feeds/feed.store'
import { observer } from 'mobx-react-lite'
import React from 'react'

export type Props = {
  feed: FeedStore
  filter?: (event: NostrEventMetadata) => boolean
  render?: (event: NostrEventMetadata) => React.ReactNode
  loading?: React.ReactNode
  divider?: boolean
  wrapper?: (children: React.ReactNode) => React.ReactNode
} & Pick<ListProps, 'column' | 'header'>

export const Feed = observer(function Feed(props: Props) {
  const { feed, render, loading, filter, ...rest } = props
  return (
    <ContentProvider value={{ blured: feed.blured }}>
      <FeedList
        feed={feed}
        filter={filter}
        onScrollEnd={feed.paginate}
        render={(event) => (render ? render(event) : <NostrEventFeedItem event={event} />)}
        footer={loading || <PostLoading rows={4} />}
        {...rest}
      />
    </ContentProvider>
  )
})
