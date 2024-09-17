import { IconHomeFilled } from '@/components/elements/Icons/IconHomeFilled'
import PaperContainer from '@/components/elements/Layouts/PaperContainer'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
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
    <>
      <DeckColumnHeader id={feed.id} name='Home Settings' settings={<HomeSettings />} renderDelete={false}>
        <Stack gap={2}>
          <IconHomeFilled />
          <Text variant='title' size='lg'>
            Home
          </Text>
        </Stack>
      </DeckColumnHeader>
      <PaperContainer elevation={0} shape='none'>
        <VirtualList
          feed={feed}
          render={(id: string) => <Post key={id} id={id} />}
          header={
            <>
              <PostCreateForm defaultOpen={false} allowLongForm />
              <Divider />
            </>
          }
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

export default HomeColumn
