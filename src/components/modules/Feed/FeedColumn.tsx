import { ComposeForm } from '@/components/elements/Compose/ComposeForm'
import { FeedItem } from '@/components/elements/Feed/FeedItem'
import { Divider } from '@/components/ui/Divider/Divider'
import { Text } from '@/components/ui/Text/Text'
import { DeckColumnHeader } from 'components/elements/Deck/DeckColumnHeader'
import { PostLoading } from 'components/elements/Posts/PostLoading'
import { VirtualList } from 'components/elements/VirtualLists/VirtualList'
import { observer } from 'mobx-react-lite'
import { useObservable, useSubscription } from 'observable-hooks'
import type { FeedModule } from 'stores/modules/feed.module'

type Props = {
  feed: FeedModule
}

export const FeedColumn = observer(function FeedModule(props: Props) {
  const { feed } = props
  const sub = useObservable(() => feed.start())
  useSubscription(sub)
  return (
    <>
      <DeckColumnHeader id={feed.id} name='Feed'>
        <Text variant='title'>Feed</Text>
      </DeckColumnHeader>
      <VirtualList
        id={feed.id}
        data={feed.list}
        onScrollEnd={feed.paginate}
        onRangeChange={feed.onRangeChange}
        render={(item) => <FeedItem item={item} />}
        header={
          <>
            <ComposeForm initialOpen={false} />
            <Divider />
          </>
        }
        footer={
          <>
            <PostLoading />
            <PostLoading />
            <Divider />
          </>
        }
      />
    </>
  )
})
