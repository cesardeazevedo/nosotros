import { UsersAvatars } from '@/components/elements/User/UsersAvatars'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Kind } from '@/constants/kinds'
import { dedupe } from '@/core/helpers/dedupe'
import { eventStore } from '@/stores/events/event.store'
import type { FeedStore } from '@/stores/feeds/feed.store'
import { observer } from 'mobx-react-lite'
import { FeedHeaderBase } from './FeedHeaderBase'

type Props = {
  feed: FeedStore
}

export const FeedHeaderFollowSet = observer(function FeedHeaderFollowSet(props: Props) {
  const { feed } = props
  const author = feed.filter.authors?.[0] || ''
  const d = feed.filter['#d']?.[0] || ''
  const events = d
    ? eventStore.getEventsByKindPubkeyTagValue(Kind.FollowSets, author, 'd', d)
    : eventStore.getEventsByKindPubkey(Kind.FollowSets, author)

  const isMultipleList = events.length > 1
  const title = events?.[0]?.getTag('title')
  const pubkeys = dedupe(events.flatMap((x) => x.getTags('p')))
  return (
    <FeedHeaderBase
      feed={feed}
      leading={
        <Stack gap={2}>
          <Text variant='title' size='lg'>
            {isMultipleList ? 'Follow Sets' : title}
          </Text>
          <UsersAvatars pubkeys={pubkeys} />
        </Stack>
      }
    />
  )
})
