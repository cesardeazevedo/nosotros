import type { ThreadGroup } from '@/atoms/threads.atoms'
import { NostrEventFeedItem } from '@/components/elements/Event/NostrEventFeedItem'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { ThreadGroupRoot } from '@/components/elements/Threads/ThreadGroupRoot'
import type { Props as ListProps } from '@/components/modules/Feed/FeedList'
import { FeedList } from '@/components/modules/Feed/FeedList'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { NostrContextProvider } from '@/components/providers/NostrContextProvider'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { FeedState } from '@/hooks/state/useFeed'
import React, { memo } from 'react'
import { FeedAuthNotice } from './FeedAuthNotice'
import { FeedEmpty } from './FeedEmpty'

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
  const showLoading = feed.options.scope === 'sets_e' ? feed.query.isFetching : !feed.isEmpty
  const isThreadsMode = feed.replies === true && feed.options.type !== 'inbox'
  const footer = <>{showLoading ? loading || <PostLoading rows={4} /> : feed.isEmpty ? <FeedEmpty feed={feed} /> : null}</>

  return (
    <NostrContextProvider value={feed.options.ctx}>
      <ContentProvider value={{ blured: feed.blured }}>
        <FeedAuthNotice context={feed.options.ctx} />
        {isThreadsMode ? (
          <FeedList<ThreadGroup>
            feed={feed}
            onScrollEnd={feed.paginate}
            getItemKey={(item) => item.rootId}
            render={(item) => <ThreadGroupRoot group={item} />}
            footer={footer}
            {...rest}
          />
        ) : (
          <FeedList<NostrEventDB>
            feed={feed}
            onScrollEnd={feed.paginate}
            render={(item) => (render ? render(item) : <NostrEventFeedItem event={item} />)}
            footer={footer}
            {...rest}
          />
        )}
      </ContentProvider>
    </NostrContextProvider>
  )
})
