import { FeedItem } from '@/components/elements/Feed/FeedItem'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { UserHeader } from '@/components/elements/User/UserHeader'
import { Stack } from '@/components/ui/Stack/Stack'
import { DeckColumnHeader } from 'components/elements/Deck/DeckColumnHeader'
import { PostLoading } from 'components/elements/Posts/PostLoading'
import { UserProfileHeader } from 'components/elements/User/UserProfileHeader'
import { VirtualList } from 'components/elements/VirtualLists/VirtualList'
import { observer } from 'mobx-react-lite'
import { useObservable, useSubscription } from 'observable-hooks'
import type { ProfileModule } from 'stores/modules/profile.module'
import { userStore } from 'stores/nostr/users.store'

type Props = {
  module: ProfileModule
}

export const UserColumn = observer(function FeedModule(props: Props) {
  const { module } = props
  const { feed } = module
  const user = userStore.get(module.options.pubkey)

  const sub = useObservable(() => feed.start())
  useSubscription(sub)

  return (
    <>
      <DeckColumnHeader id={feed.id} name='Settings'>
        <Stack gap={2}>
          <UserHeader pubkey={user?.pubkey} />
        </Stack>
      </DeckColumnHeader>
      <PaperContainer elevation={0} shape='none'>
        <VirtualList
          id={feed.id}
          data={feed.list}
          onScrollEnd={feed.paginate}
          onRangeChange={feed.onRangeChange}
          header={<UserProfileHeader user={user} />}
          render={(item) => <FeedItem item={item} />}
          footer={
            <>
              <PostLoading />
              <PostLoading />
            </>
          }
        />
      </PaperContainer>
    </>
  )
})
