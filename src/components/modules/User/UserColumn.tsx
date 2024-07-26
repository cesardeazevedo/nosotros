import { Box, Divider, Typography } from '@mui/material'
import DeckColumnHeader from 'components/elements/Deck/DeckColumnHeader'
import Post from 'components/elements/Posts/Post'
import PostLoading from 'components/elements/Posts/PostLoading'
import UserAvatar from 'components/elements/User/UserAvatar'
import UserProfileHeader from 'components/elements/User/UserProfileHeader'
import VirtualList from 'components/elements/VirtualLists/VirtualList'
import { useModuleSubscription } from 'hooks/useFeedSubscription'
import { observer } from 'mobx-react-lite'
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
    <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <DeckColumnHeader id={feed.id} name='Settings'>
        <UserAvatar user={user} size={32} />
        <Typography variant='h6' fontWeight='bold' sx={{ ml: 1 }}>
          {user?.displayName}
        </Typography>
      </DeckColumnHeader>
      <Divider />
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
    </Box>
  )
})

export default UserColumn
