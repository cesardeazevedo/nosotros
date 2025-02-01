import { NostrEventFeedItem } from '@/components/elements/Event/NostrEventFeedItem'
import { FeedSettings } from '@/components/elements/Feed/FeedSettings'
import { List } from '@/components/elements/List/List'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { RelayChip } from '@/components/elements/Relays/RelayChip'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { NostrProvider } from '@/components/providers/NostrProvider'
import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { Stack } from '@/components/ui/Stack/Stack'
import { Kind } from '@/constants/kinds'
import { useFeedSubscription } from '@/hooks/useFeedSubscription'
import { useGlobalNostrSettings } from '@/hooks/useRootStore'
import { RelayFeedModuleModel } from '@/stores/relays/relay.feed.module'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { useSearch } from '@tanstack/react-router'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { css } from 'react-strict-dom'
import { CenteredContainer } from '../../elements/Layouts/CenteredContainer'
import { PaperContainer } from '../../elements/Layouts/PaperContainer'

export const RelayFeedRoute = observer(function RelayFeedRoute() {
  const params = useSearch({ from: '/' })

  const relays = params.relay ? [params.relay].flat() : []
  const nostrSettings = useGlobalNostrSettings()
  const [module] = useState(
    RelayFeedModuleModel.create({
      relays,
      feed: {
        filter: { kinds: [Kind.Text, Kind.Repost] },
        scope: 'self',
        blured: true,
        options: {
          includeParents: true,
          includeReplies: true,
        },
      },
      context: {
        settings: {
          ...nostrSettings,
          localDB: false,
          localRelays: [],
          scroll: {
            replies: true,
            zaps: true,
            reposts: true,
            reactions: true,
          },
        },
        options: {
          relays,
        },
      },
    }),
  )

  const [expanded, setExpanded] = useState(false)

  useFeedSubscription(module.feed, module.contextWithFallback.client)

  return (
    <NostrProvider nostrContext={() => module.context!}>
      <CenteredContainer margin>
        <PaperContainer elevation={1}>
          <Stack sx={styles.header} justify='space-between'>
            <Stack gap={0.5}>
              {relays.map((relay) => (
                <RelayChip key={relay} url={relay} />
              ))}
            </Stack>
            <Button variant='filledTonal' onClick={() => setExpanded((prev) => !prev)}>
              <Stack gap={0.5}>
                {expanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
                Feed Settings
              </Stack>
            </Button>
          </Stack>
          <Expandable expanded={expanded}>
            <FeedSettings feed={module.feed} />
          </Expandable>
          <Divider />
          <ContentProvider value={{ blured: module.feed.blured }}>
            <List
              feed={module.feed}
              onScrollEnd={module.feed.paginate}
              render={(event) => <NostrEventFeedItem event={event} />}
              footer={<PostLoading rows={4} />}
            />
          </ContentProvider>
        </PaperContainer>
      </CenteredContainer>
    </NostrProvider>
  )
})

const styles = css.create({
  header: {
    padding: spacing.padding2,
  },
})
