import PaperContainer from '@/components/elements/Layouts/PaperContainer'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import DeckColumnHeader from 'components/elements/Deck/DeckColumnHeader'
import Post from 'components/elements/Posts/Post'
import PostLoading from 'components/elements/Posts/PostLoading'
import UserAvatar from 'components/elements/User/UserAvatar'
import UserProfileHeader from 'components/elements/User/UserProfileHeader'
import VirtualList from 'components/elements/VirtualLists/VirtualList'
import { useModuleSubscription } from 'hooks/useFeedSubscription'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import type { ProfileModule } from 'stores/modules/profile.module'
import { userStore } from 'stores/nostr/users.store'

type Props = {
  module: ProfileModule
}

const UserColumn = observer(function FeedModule(props: Props) {
  const { module } = props
  const { feed } = module
  const user = userStore.get(module.options.pubkey)

  useModuleSubscription(feed)

  return (
    <>
      <DeckColumnHeader id={feed.id} name='Settings'>
        <Stack gap={2}>
          <UserAvatar size='sm' user={user} />
          <Text variant='title' size='lg' sx={styles.title}>
            {user?.displayName}
          </Text>
        </Stack>
      </DeckColumnHeader>
      <PaperContainer elevation={0} shape='none'>
        <VirtualList
          feed={feed}
          header={<UserProfileHeader user={user} />}
          render={(id) => <Post key={id} id={id} />}
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

const styles = css.create({
  title: {
    maxWidth: 350,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
})

export default UserColumn
