import { DeckColumnHeader } from '@/components/elements/Deck/DeckColumnHeader'
import { DeckContext } from '@/components/elements/Deck/DeckContext'
import { Editor } from '@/components/elements/Editor/Editor'
import { NostrEventFeedItem } from '@/components/elements/Event/NostrEventFeedItem'
import { FeedList } from '@/components/elements/Feed/FeedList'
import { FeedSettings } from '@/components/elements/Feed/FeedSettings'
import { FeedTabs } from '@/components/elements/Feed/FeedTabs'
import { IconHomeFilled } from '@/components/elements/Icons/IconHomeFilled'
import { PostAwait } from '@/components/elements/Posts/PostAwait'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { UserAvatar } from '@/components/elements/User/UserAvatar'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { useFeedSubscription } from '@/hooks/useFeedSubscription'
import type { HomeModule } from '@/stores/modules/home.module'
import { observer } from 'mobx-react-lite'
import { useContext } from 'react'

type Props = {
  module: HomeModule
}

export const HomeColumn = observer(function HomeColumn(props: Props) {
  const { module } = props
  const { id } = module
  const feed = module.feed
  const { delay } = useContext(DeckContext)

  useFeedSubscription(feed, module.contextWithFallback.context)

  return (
    <>
      <DeckColumnHeader id={id} settings={<FeedSettings feed={feed} />}>
        <Stack gap={2}>
          <IconHomeFilled size={26} />
          <UserAvatar size='sm' pubkey={module.feed.filter.authors?.[0]} />
          <FeedTabs module={module} />
        </Stack>
      </DeckColumnHeader>
      <PostAwait promise={delay}>
        <FeedList
          column
          feed={feed}
          onScrollEnd={feed.paginate}
          header={
            <>
              <Editor initialOpen={false} store={module.editor} />
              <Divider />
            </>
          }
          footer={
            <>
              <PostLoading rows={8} />
              <Divider />
            </>
          }
          render={(event) => <NostrEventFeedItem event={event} />}
        />
      </PostAwait>
    </>
  )
})
