import { DeckColumnHeader } from '@/components/elements/Deck/DeckColumnHeader'
import { Editor } from '@/components/elements/Editor/Editor'
import { FeedItem } from '@/components/elements/Feed/FeedItem'
import { IconHomeFilled } from '@/components/elements/Icons/IconHomeFilled'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { VirtualListColumn } from '@/components/elements/VirtualLists/VirtualListColumn'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useRootStore } from '@/hooks/useRootStore'
import { useFeed } from '@/stores/feeds/hooks/useFeed'
import { useFeedScroll } from '@/stores/feeds/hooks/useFeedScroll'
import type { HomeModule } from '@/stores/home/home.module'
import type { WelcomeModule } from '@/stores/welcome/welcome.module'
import { HomeSettings } from './HomeSettings'

type Props = {
  module: HomeModule | WelcomeModule
}

export const HomeColumn = (props: Props) => {
  const { module } = props
  const { id } = module
  const root = useRootStore()
  const feed = module.feed || root.welcome.feed
  const onRangeChange = useFeedScroll(feed)
  useFeed(feed)

  return (
    <>
      <DeckColumnHeader id={id} name='Home Settings' settings={<HomeSettings />}>
        <Stack gap={2}>
          <IconHomeFilled />
          <Text variant='title' size='md'>
            Home
          </Text>
        </Stack>
      </DeckColumnHeader>
      <PaperContainer elevation={0} shape='none'>
        <VirtualListColumn
          id={id}
          feed={feed}
          onRangeChange={onRangeChange}
          header={
            <>
              <Editor initialOpen={false} store={module.editor} />
              <Divider />
            </>
          }
          footer={
            <>
              <PostLoading />
              <Divider />
            </>
          }
          render={(item) => <FeedItem item={item} />}
        />
      </PaperContainer>
    </>
  )
}
