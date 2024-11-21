import { ComposeForm } from '@/components/elements/Compose/ComposeForm'
import { DeckColumnHeader } from '@/components/elements/Deck/DeckColumnHeader'
import { FeedItem } from '@/components/elements/Feed/FeedItem'
import { IconHomeFilled } from '@/components/elements/Icons/IconHomeFilled'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { VirtualList } from '@/components/elements/VirtualLists/VirtualList'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { observer } from 'mobx-react-lite'
import { useObservable, useSubscription } from 'observable-hooks'
import type { GuestModule } from 'stores/modules/guest.module'
import type { HomeModule } from 'stores/modules/home.module'
import { HomeSettings } from './HomeSettings'

type Props = {
  module: HomeModule | GuestModule
}

export const HomeColumn = observer(function HomeColumn(props: Props) {
  const { module } = props
  const { feed } = module

  const sub = useObservable(() => feed.start())
  useSubscription(sub)

  return (
    <>
      <DeckColumnHeader id={feed.id} name='Home Settings' settings={<HomeSettings />}>
        <Stack gap={2}>
          <IconHomeFilled />
          <Text variant='title' size='md'>
            Home
          </Text>
        </Stack>
      </DeckColumnHeader>
      <PaperContainer elevation={0} shape='none'>
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
      </PaperContainer>
    </>
  )
})
