import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { PostThread } from '@/components/elements/Posts/PostThread'
import { VirtualList } from '@/components/elements/VirtualLists/VirtualList'
import type { FeedAbstract, VirtualListProps } from '@/components/elements/VirtualLists/VirtualLists.types'
import { useFeedScroll } from '@/stores/feeds/hooks/useFeedScroll'
import type { Note } from '@/stores/notes/note'
import type { NProfileModule } from '@/stores/nprofile/nprofile.module'

export type Props = {
  module: NProfileModule
} & Pick<VirtualListProps<FeedAbstract>, 'window' | 'header'>

export const NProfileRepliesFeed = function NProfileRepliesFeed(props: Props) {
  const { module, ...rest } = props
  const {
    id,
    feeds: { replies },
  } = module
  const onRangeChange = useFeedScroll(replies)
  return (
    <VirtualList
      id={id}
      feed={replies}
      onScrollEnd={() => replies.paginate()}
      onRangeChange={onRangeChange}
      render={(item) => <PostThread note={item as Note} />}
      footer={<PostLoading />}
      {...rest}
    />
  )
}
