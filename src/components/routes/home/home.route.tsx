import { Editor } from '@/components/elements/Editor/Editor'
import { NostrEventFeedItem } from '@/components/elements/Event/NostrEventFeedItem'
import { FeedList } from '@/components/elements/Feed/FeedList'
import { FeedSettings } from '@/components/elements/Feed/FeedSettings'
import { FeedTabs } from '@/components/elements/Feed/FeedTabs'
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
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { PostFabButton } from '../../elements/Buttons/PostFabButton'
import { CenteredContainer } from '../../elements/Layouts/CenteredContainer'
import { PaperContainer } from '../../elements/Layouts/PaperContainer'

export const HomeRoute = observer(function HomeRoute() {
  const mobile = useMobile()
  const module = useHomeModule()
  const pubkey = useCurrentPubkey()

  const feed = module?.feed

  const [expanded, setExpanded] = useState(false)

  useFeedSubscription(module.feed, module.contextWithFallback.context)

  return (
    <CenteredContainer margin>
      {!mobile && pubkey && <PostFabButton />}
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
          <Editor initialOpen={false} store={module.editor} />
        </Stack>
        <Divider />
        <ContentProvider value={{ blured: feed.blured }}>
          <FeedList
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
