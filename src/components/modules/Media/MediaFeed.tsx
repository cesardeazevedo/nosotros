import { NostrEventFeedItem } from '@/components/elements/Event/NostrEventFeedItem'
import { FeedList } from '@/components/modules/Feed/FeedList'
import { MediaCell } from '@/components/elements/Media/MediaCell'
import { PostMediaLoading } from '@/components/elements/Media/MediaLoading'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { Stack } from '@/components/ui/Stack/Stack'
import type { MediaModule } from '@/stores/modules/media.module'
import { observer, Observer } from 'mobx-react-lite'
import type { ReactNode } from 'react'
import { css } from 'react-strict-dom'

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
          <Stack wrap gap={0.5} justify='flex-start' sx={styles.grid}>
            {children}
          </Stack>
        ) : (
          children
        )
      }
      render={(event) => (
        <Observer>
          {() => <>{module.layout === 'row' ? <NostrEventFeedItem event={event} /> : <MediaCell event={event} />}</>}
        </Observer>
      )}
      footer={module.layout === 'row' ? <PostLoading rows={4} /> : <PostMediaLoading rows={3} />}
    />
  )
})

const styles = css.create({
  grid: {
    '::after': {
      content: '""',
      flex: '1 1 calc(33.33% - 20px)',
    },
  },
})
