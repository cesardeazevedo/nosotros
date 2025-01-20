import { NostrEventRoot } from '@/components/elements/Event/NostrEventRoot'
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
      onScrollEnd={feed.paginate}
      render={(event) => <NostrEventRoot event={event} />}
      footer={<PostLoading />}
      {...rest}
    />
  )
}
