import { Divider } from '@/components/ui/Divider/Divider'
import Post from 'components/elements/Posts/Post'
import PostCreateForm from 'components/elements/Posts/PostCreate/PostCreateForm'
import PostLoading from 'components/elements/Posts/PostLoading'
import VirtualListWindow from 'components/elements/VirtualLists/VirtualListWindow'
import { useModuleSubscription } from 'hooks/useFeedSubscription'
import { observer } from 'mobx-react-lite'
import type { FeedModule } from 'stores/modules/feed.module'

type Props = {
  feed: FeedModule
  renderCreatePost?: boolean
}

const FeedMain = observer(function FeedModule(props: Props) {
  const { feed, renderCreatePost } = props

  useModuleSubscription(feed)

  return (
    <div>
      {renderCreatePost && <PostCreateForm defaultOpen={false} allowLongForm={false} />}
      <Divider />
      <VirtualListWindow feed={feed} render={(id) => <Post key={id} id={id} />} />
      <PostLoading />
      <PostLoading />
    </div>
  )
})

export default FeedMain
