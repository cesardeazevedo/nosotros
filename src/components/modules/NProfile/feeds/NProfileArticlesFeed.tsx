import { NostrEventRoot } from '@/components/elements/Event/NostrEventRoot'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { VirtualList } from '@/components/elements/VirtualLists/VirtualList'
import type { FeedAbstract, VirtualListProps } from '@/components/elements/VirtualLists/VirtualLists.types'
import { useFeedScroll } from '@/stores/feeds/hooks/useFeedScroll'
import type { NProfileModule } from '@/stores/nprofile/nprofile.module'

export type Props = {
  module: NProfileModule
} & Pick<VirtualListProps<FeedAbstract>, 'window' | 'header'>

export const NProfileArticlesFeed = function NProfileArticlesFeed(props: Props) {
  const { module, ...rest } = props
  const {
    id,
    feeds: { articles },
  } = module
  useFeedScroll(articles)
  return (
    <VirtualList
      id={id}
      feed={articles}
      onScrollEnd={() => articles.paginate()}
      render={(event) => <NostrEventRoot event={event} />}
      footer={<PostLoading />}
      {...rest}
    />
  )
}
