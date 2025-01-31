import { Editor } from '@/components/elements/Editor/Editor'
import { NostrEventFeedItem } from '@/components/elements/Event/NostrEventFeedItem'
import { FeedSettings } from '@/components/elements/Feed/FeedSettings'
import { FeedTabs } from '@/components/elements/Feed/FeedTabs'
import { List } from '@/components/elements/List/List'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { Stack } from '@/components/ui/Stack/Stack'
import { useFeedSubscription } from '@/hooks/useFeedSubscription'
import { useHomeModule } from '@/hooks/useHomeModule'
import { useMobile } from '@/hooks/useMobile'
import { useCurrentPubkey } from '@/hooks/useRootStore'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { css } from 'react-strict-dom'
import { CenteredContainer } from '../../elements/Layouts/CenteredContainer'
import { PaperContainer } from '../../elements/Layouts/PaperContainer'
import { PostFab } from '../../elements/Posts/PostFab'

export const HomeRoute = observer(function HomeRoute() {
  const mobile = useMobile()
  const module = useHomeModule()
  const pubkey = useCurrentPubkey()

  const feed = module?.feed

  const [expanded, setExpanded] = useState(false)

  useFeedSubscription(module.feed, module.contextWithFallback.client)

  return (
    <CenteredContainer margin>
      {!mobile && pubkey && <PostFab />}
      <PaperContainer>
        <FeedTabs module={module}>
          <Button variant='filledTonal' onClick={() => setExpanded((prev) => !prev)}>
            <Stack gap={0.5}>
              {expanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
              Feed Settings
            </Stack>
          </Button>
        </FeedTabs>
        <Expandable expanded={expanded}>
          <FeedSettings feed={feed} />
        </Expandable>
        <Divider />
        <Stack horizontal={false} align='stretch' justify='space-between'>
          <Editor
            initialOpen={false}
            store={module.editor}
            sx={[styles.editor, module.editor.open.value && styles.editor$open]}
          />
        </Stack>
        <Divider />
        <ContentProvider value={{ blured: feed.blured }}>
          <List
            feed={feed}
            onScrollEnd={feed.paginate}
            render={(event) => <NostrEventFeedItem event={event} />}
            footer={<PostLoading rows={4} />}
          />
        </ContentProvider>
      </PaperContainer>
    </CenteredContainer>
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
