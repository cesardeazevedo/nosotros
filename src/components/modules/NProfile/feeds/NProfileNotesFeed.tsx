import { NostrEventFeedItem } from '@/components/elements/Event/NostrEventFeedItem'
import type { Props as ListProps } from '@/components/elements/List/List'
import { List } from '@/components/elements/List/List'
import { PostAwait } from '@/components/elements/Posts/PostAwait'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { ContentProvider } from '@/components/providers/ContentProvider'
import type { NProfileModule } from '@/stores/nprofile/nprofile.module'

export type Props = {
  module: NProfileModule
  delay?: Promise<0>
} & Pick<ListProps, 'column' | 'header'>

export const NProfileNotesFeed = function NProfileNotesFeed(props: Props) {
  const { module, ...rest } = props
  const feed = module.feeds.notes
  return (
    <ContentProvider value={{ blured: feed.blured }}>
      <List
        feed={feed}
        wrapper={(children) => (
          <PostAwait promise={props.delay || feed.delay} rows={4}>
            {children}
          </PostAwait>
        )}
        onScrollEnd={feed.paginate}
        render={(event) => <NostrEventFeedItem event={event} />}
        footer={<PostLoading rows={4} />}
        {...rest}
      />
    </ContentProvider>
  )
}
