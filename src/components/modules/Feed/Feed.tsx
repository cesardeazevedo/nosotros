import { NostrEventFeedItem } from '@/components/elements/Event/NostrEventFeedItem'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import type { Props as ListProps } from '@/components/modules/Feed/FeedList'
import { FeedList } from '@/components/modules/Feed/FeedList'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { NostrContextProvider } from '@/components/providers/NostrContextProvider'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { FeedState } from '@/hooks/state/useFeed'
import React, { memo } from 'react'
import { FeedAuthNotice } from './FeedAuthNotice'

export type Props = {
  feed: FeedState
  events?: NostrEventDB[][]
  render?: (event: NostrEventDB) => React.ReactNode
  loading?: React.ReactNode
  divider?: boolean
  wrapper?: (children: React.ReactNode) => React.ReactNode
} & Pick<ListProps, 'column' | 'header'>

export const Feed = memo(function Feed(props: Props) {
  const { feed, render, loading, ...rest } = props
  return (
    <NostrContextProvider value={feed.options.ctx}>
      <ContentProvider value={{ blured: feed.blured }}>
        <FeedAuthNotice context={feed.options.ctx} />
        <FeedList
          feed={feed}
          onScrollEnd={feed.paginate}
          render={(event) => (render ? render(event) : <NostrEventFeedItem event={event} />)}
          footer={loading || <PostLoading rows={4} />}
          {...rest}
        />
      </ContentProvider>
    </NostrContextProvider>
  )
})
