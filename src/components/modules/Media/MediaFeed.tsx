import { NostrEventFeedItem } from '@/components/elements/Event/NostrEventFeedItem'
import { FeedList } from '@/components/elements/Feed/FeedList'
import { MediaCell } from '@/components/elements/Media/MediaCell'
import { PostMediaLoading } from '@/components/elements/Media/MediaLoading'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { Stack } from '@/components/ui/Stack/Stack'
import type { NostrEventMedia } from '@/nostr/types'
import type { MediaModule } from '@/stores/modules/media.module'
import { observer, Observer } from 'mobx-react-lite'
import type { ReactNode } from 'react'

type Props = {
  header?: ReactNode
  column?: boolean
  module: MediaModule
}

export const MediaFeed = observer(function MediaFeed(props: Props) {
  const { header, module, column } = props
  const feed = module.feed
  return (
    <FeedList
      column={column}
      feed={feed}
      header={header}
      divider={module.layout === 'row'}
      onScrollEnd={feed.paginate}
      wrapper={(children) =>
        module.layout === 'grid' ? (
          <Stack wrap gap={0.5}>
            {children}
          </Stack>
        ) : (
          children
        )
      }
      render={(event) => (
        <Observer>
          {() => (
            <>
              {module.layout === 'row' ? (
                <NostrEventFeedItem event={event} />
              ) : (
                <MediaCell event={event as NostrEventMedia} />
              )}
            </>
          )}
        </Observer>
      )}
      footer={module.layout === 'row' ? <PostLoading /> : <PostMediaLoading rows={3} />}
    />
  )
})
