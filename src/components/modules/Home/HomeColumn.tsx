import { Box, Typography } from '@mui/material'
import { IconHome } from '@tabler/icons-react'
import DeckColumnHeader from 'components/elements/Deck/DeckColumnHeader'
import Post from 'components/elements/Posts/Post'
import PostCreateForm from 'components/elements/Posts/PostCreate/PostCreateForm'
import PostLoading from 'components/elements/Posts/PostLoading'
import VirtualList from 'components/elements/VirtualLists/VirtualList'
import { useModuleSubscription } from 'hooks/useFeedSubscription'
import { observer } from 'mobx-react-lite'
import type { GuestModule } from 'stores/modules/guest.module'
import type { HomeModule } from 'stores/modules/home.module'
import HomeSettings from './HomeSettings'

type Props = {
  module: HomeModule | GuestModule
}

const HomeColumn = observer(function HomeColumn(props: Props) {
  const { module } = props
  const { feed } = module

  useModuleSubscription(feed)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative', p: 0 }}>
      <DeckColumnHeader id={feed.id} settings={<HomeSettings />}>
        <IconHome strokeWidth='2' size={24} />
        <Typography variant='h6' fontWeight='bold' sx={{ ml: 1 }}>
          Home
        </Typography>
      </DeckColumnHeader>
      <VirtualList
        feed={feed}
        render={(id: string) => <Post key={id} id={id} />}
        header={<PostCreateForm />}
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

export default HomeColumn
