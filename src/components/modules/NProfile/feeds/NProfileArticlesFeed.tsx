import { NostrEventFeedItem } from '@/components/elements/Event/NostrEventFeedItem'
import type { Props as ListProps } from '@/components/elements/Feed/FeedList'
import { FeedList } from '@/components/elements/Feed/FeedList'
import { PostAwait } from '@/components/elements/Posts/PostAwait'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import type { NProfileModule } from '@/stores/nprofile/nprofile.module'

export type Props = {
  module: NProfileModule
  delay?: Promise<0>
} & Pick<ListProps, 'column' | 'header'>

export const NProfileArticlesFeed = function NProfileArticlesFeed(props: Props) {
  const { module, delay, ...rest } = props
  const feed = module.feeds.articles
  return (
    <FeedList
      feed={feed}
      onScrollEnd={feed.paginate}
      wrapper={(children) => (
        <PostAwait promise={delay || feed.delay} rows={4}>
          {children}
        </PostAwait>
      )}
      render={(event) => <NostrEventFeedItem event={event} />}
      footer={<PostLoading rows={4} />}
      {...rest}
    />
  )
}
