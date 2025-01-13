import { NostrEventRoot } from '@/components/elements/Event/NostrEventRoot'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { VirtualList } from '@/components/elements/VirtualLists/VirtualList'
import type { FeedAbstract, VirtualListProps } from '@/components/elements/VirtualLists/VirtualLists.types'
import { useFeedScroll } from '@/stores/feeds/hooks/useFeedScroll'
import type { NProfileModule } from '@/stores/nprofile/nprofile.module'

export type Props = {
  module: NProfileModule
} & Pick<VirtualListProps<FeedAbstract>, 'window' | 'header'>

export const NProfilePhotosFeed = function NProfilePhotosFeed(props: Props) {
  const { module, ...rest } = props
  const {
    id,
    feeds: { photos },
  } = module
  const onRangeChange = useFeedScroll(photos)
  return (
    <VirtualList
      id={id}
      feed={photos}
      onScrollEnd={() => photos.paginate()}
      onRangeChange={onRangeChange}
      render={(event) => <NostrEventRoot event={event} />}
      footer={<PostLoading />}
      {...rest}
    />
  )
}
