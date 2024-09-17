import { Text } from '@/components/ui/Text/Text'
import DeckColumnHeader from 'components/elements/Deck/DeckColumnHeader'
import Post from 'components/elements/Posts/Post'
import PostLoading from 'components/elements/Posts/PostLoading'
import VirtualList from 'components/elements/VirtualLists/VirtualList'
import { observer } from 'mobx-react-lite'
import type { FeedModule } from 'stores/modules/feed.module'

type Props = {
  feed: FeedModule
}

const FeedColumn = observer(function FeedModule(props: Props) {
  const { feed } = props
  return (
    <>
      <DeckColumnHeader id={feed.id} name='Feed'>
        <Text variant='title'>Feed</Text>
      </DeckColumnHeader>
      <VirtualList
        feed={feed}
        render={(id) => <Post key={id} id={id} />}
        footer={
          <>
            <PostLoading />
            <PostLoading />
          </>
        }
      />
    </>
  )
})

export default FeedColumn
