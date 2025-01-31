import { DeckColumnHeader } from '@/components/elements/Deck/DeckColumnHeader'
import { DeckContext } from '@/components/elements/Deck/DeckContext'
import { Editor } from '@/components/elements/Editor/Editor'
import { NostrEventFeedItem } from '@/components/elements/Event/NostrEventFeedItem'
import { FeedSettings } from '@/components/elements/Feed/FeedSettings'
import { FeedTabs } from '@/components/elements/Feed/FeedTabs'
import { IconHomeFilled } from '@/components/elements/Icons/IconHomeFilled'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { List } from '@/components/elements/List/List'
import { PostAwait } from '@/components/elements/Posts/PostAwait'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { UserAvatar } from '@/components/elements/User/UserAvatar'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { useFeedSubscription } from '@/hooks/useFeedSubscription'
import type { HomeModule } from '@/stores/home/home.module'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  module: HomeModule
}

export const HomeColumn = observer(function HomeColumn(props: Props) {
  const { module } = props
  const { id } = module
  const feed = module.feed
  const context = useContext(DeckContext)

  useFeedSubscription(feed, module.contextWithFallback.client)

  return (
    <>
      <DeckColumnHeader id={id} settings={<FeedSettings feed={feed} />}>
        <Stack gap={2}>
          <IconHomeFilled size={26} />
          <UserAvatar size='sm' pubkey={module.feed.filter.authors?.[0]} />
          <FeedTabs module={module} />
        </Stack>
      </DeckColumnHeader>
      <PaperContainer elevation={0} shape='none'>
        <PostAwait promise={context.delay}>
          <List
            column
            feed={feed}
            onScrollEnd={feed.paginate}
            header={
              <>
                <Editor
                  initialOpen={false}
                  store={module.editor}
                  sx={[styles.editor, module.editor.open.value && styles.editor$open]}
                />
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
      </PaperContainer>
    </>
  )
})

const styles = css.create({
  editor: {
    paddingLeft: spacing.padding2,
    paddingBlock: spacing.padding2,
  },
  editor$open: {
    paddingBlock: spacing.padding1,
    paddingTop: spacing.padding2,
  },
})
