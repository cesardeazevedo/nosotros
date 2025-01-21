import { NostrEventFeedItem } from '@/components/elements/Event/NostrEventFeedItem'
import { PostAwait } from '@/components/elements/Posts/PostAwait'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { VirtualList } from '@/components/elements/VirtualLists/VirtualList'
import type { FeedAbstract, VirtualListProps } from '@/components/elements/VirtualLists/VirtualLists.types'
import type { NProfileModule } from '@/stores/nprofile/nprofile.module'

export type Props = {
  module: NProfileModule
} & Pick<VirtualListProps<FeedAbstract>, 'window' | 'header'>

export const NProfileRepliesFeed = function NProfileRepliesFeed(props: Props) {
  const { module, ...rest } = props
  const {
    id,
    feeds: { replies: feed },
  } = module
  return (
    <VirtualList
      id={id}
      feed={feed}
      wrapper={(children) => (
        <PostAwait promise={feed.delay} rows={5}>
          {children}
        </PostAwait>
      )}
      onScrollEnd={feed.paginate}
      render={(event) => <NostrEventFeedItem event={event} />}
      footer={<PostLoading />}
      {...rest}
    />
  )
}
