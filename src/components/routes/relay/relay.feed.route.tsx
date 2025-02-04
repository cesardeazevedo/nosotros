import { NostrEventFeedItem } from '@/components/elements/Event/NostrEventFeedItem'
import { FeedList } from '@/components/elements/Feed/FeedList'
import { FeedSettings } from '@/components/elements/Feed/FeedSettings'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { RelayChip } from '@/components/elements/Relays/RelayChip'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { Button } from '@/components/ui/Button/Button'
import { Divider } from '@/components/ui/Divider/Divider'
import { Expandable } from '@/components/ui/Expandable/Expandable'
import { Stack } from '@/components/ui/Stack/Stack'
import { useFeedSubscription } from '@/hooks/useFeedSubscription'
import { useNostrContextInitializer } from '@/stores/context/nostr.context.hooks'
import { createRelayFeedModule } from '@/stores/relays/relay.feed.module'
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

  const [module] = useState(createRelayFeedModule(relays))

  const [expanded, setExpanded] = useState(false)

  useNostrContextInitializer(module.context)
  useFeedSubscription(module.feed, module.contextWithFallback.client)

  return (
    <CenteredContainer margin>
      <PaperContainer>
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
          <FeedList
            feed={module.feed}
            onScrollEnd={module.feed.paginate}
            render={(event) => <NostrEventFeedItem event={event} />}
            footer={<PostLoading rows={4} />}
          />
        </ContentProvider>
      </PaperContainer>
    </CenteredContainer>
  )
})

const styles = css.create({
  header: {
    padding: spacing.padding2,
  },
})
