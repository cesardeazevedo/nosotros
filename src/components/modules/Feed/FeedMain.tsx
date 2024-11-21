import { ComposeForm } from '@/components/elements/Compose/ComposeForm'
import { FeedItem } from '@/components/elements/Feed/FeedItem'
import { Divider } from '@/components/ui/Divider/Divider'
import { PostLoading } from 'components/elements/Posts/PostLoading'
import { VirtualListWindow } from 'components/elements/VirtualLists/VirtualListWindow'
import { observer } from 'mobx-react-lite'
import type { FeedModule } from 'stores/modules/feed.module'

type Props = {
  feed: FeedModule
  renderCreatePost?: boolean
}

export const FeedMain = observer(function FeedMain(props: Props) {
  const { feed, renderCreatePost } = props

  return (
    <>
      {renderCreatePost && <ComposeForm initialOpen={false} allowLongForm={false} />}
      <Divider />
      <VirtualListWindow
        id={feed.id}
        data={feed.list}
        onScrollEnd={feed.paginate}
        onRangeChange={feed.onRangeChange}
        render={(item) => <FeedItem item={item} />}
      />
      <PostLoading />
      <Divider />
      <PostLoading />
    </>
  )
})
