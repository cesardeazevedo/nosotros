import { DeckColumnHeader } from '@/components/elements/Deck/DeckColumnHeader'
import { NostrEventFeedItem } from '@/components/elements/Event/NostrEventFeedItem'
import { FeedList } from '@/components/elements/Feed/FeedList'
import { FeedSettings } from '@/components/elements/Feed/FeedSettings'
import { PostLoading } from '@/components/elements/Posts/PostLoading'
import { RelayChip } from '@/components/elements/Relays/RelayChip'
import { ContentProvider } from '@/components/providers/ContentProvider'
import { Button } from '@/components/ui/Button/Button'
import { Stack } from '@/components/ui/Stack/Stack'
import { useFeedSubscription } from '@/hooks/useFeedSubscription'
import { useNostrContextInitializer } from '@/stores/context/nostr.context.hooks'
import type { RelayFeedModule } from '@/stores/relays/relay.feed.module'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'

type Props = {
  module: RelayFeedModule
}

export const RelayFeedColumn = observer(function RelayFeedColumn(props: Props) {
  const { module } = props
  const relays = module.relays

  useNostrContextInitializer(module.context)
  useFeedSubscription(module.feed, module.context!.client)

  return (
    <>
      <DeckColumnHeader
        id={module.id}
        settingsIcon={({ expanded, expand }) => (
          <Button variant='filledTonal' onClick={() => expand(!expanded)}>
            <Stack gap={0.5}>
              {expanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
              Settings
            </Stack>
          </Button>
        )}
        settings={<FeedSettings feed={module.feed} />}>
        <Stack gap={2}>
          <Stack gap={0.5}>
            {relays.map((relay) => (
              <RelayChip key={relay} url={relay} />
            ))}
          </Stack>
        </Stack>
      </DeckColumnHeader>

      <>
        <ContentProvider value={{ blured: module.feed.blured }}>
          <FeedList
            column
            feed={module.feed}
            onScrollEnd={module.feed.paginate}
            render={(event) => <NostrEventFeedItem event={event} />}
            footer={<PostLoading rows={4} />}
          />
        </ContentProvider>
      </>
    </>
  )
})
