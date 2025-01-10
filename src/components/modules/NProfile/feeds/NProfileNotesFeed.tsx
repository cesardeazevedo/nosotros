import { NostrEventRoot } from '@/components/elements/Event/NostrEventRoot'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { VirtualList } from '@/components/elements/VirtualLists/VirtualList'
import type { FeedAbstract, VirtualListProps } from '@/components/elements/VirtualLists/VirtualLists.types'
import { useFeedScroll } from '@/stores/feeds/hooks/useFeedScroll'
import type { NProfileModule } from '@/stores/nprofile/nprofile.module'

export type Props = {
  module: NProfileModule
} & Pick<VirtualListProps<FeedAbstract>, 'window' | 'header'>

export const NProfileNotesFeed = function NProfileNotesFeed(props: Props) {
  const { module, ...rest } = props
  const {
    id,
    feeds: { notes },
  } = module
  const onRangeChange = useFeedScroll(notes)
  return (
    <VirtualList
      id={id}
      feed={notes}
      onScrollEnd={() => notes.paginate()}
      onRangeChange={onRangeChange}
      render={(event) => <NostrEventRoot event={event} />}
      footer={<PostLoading />}
      {...rest}
    />
  )
}
