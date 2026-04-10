import { NostrEventFeedItem } from '@/components/elements/Event/NostrEventFeedItem'
import { MediaCell } from '@/components/elements/Media/MediaCell'
import { PostMediaLoading } from '@/components/elements/Media/MediaLoading'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { FeedList } from '@/components/modules/Feed/FeedList'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { NostrContextProvider } from '@/components/providers/NostrContextProvider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { MediaFeedState } from '@/hooks/state/useMediaFeed'
import { memo, type ReactNode } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  header?: ReactNode
  column?: boolean
  feed: MediaFeedState
}

export const MediaFeed = memo(function MediaFeed(props: Props) {
  const { header, feed, column } = props
  return (
    <NostrContextProvider value={feed.options.ctx}>
      <ContentProvider value={{ blured: feed.blured }}>
        <FeedList
          key={feed.layout}
          column={column}
          feed={feed}
          header={header}
          onScrollEnd={feed.paginate}
          renderNewPostsIndicator={feed.layout === 'row'}
          wrapper={(children) =>
            feed.layout === 'grid' ? (
              <Stack wrap gap={0.5} justify='flex-start' sx={styles.grid}>
                {children}
              </Stack>
            ) : (
              children
            )
          }
          render={(event: NostrEventDB) =>
            feed.layout === 'row' ? <NostrEventFeedItem event={event} /> : <MediaCell event={event} />
          }
          footer={feed.layout === 'row' ? <PostLoading rows={4} /> : <PostMediaLoading rows={3} />}
        />
      </ContentProvider>
    </NostrContextProvider>
  )
})

const styles = css.create({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
})
