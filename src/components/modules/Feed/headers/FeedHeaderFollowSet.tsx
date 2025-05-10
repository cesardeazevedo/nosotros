import { Stack } from '@/components/ui/Stack/Stack'
import { Kind } from '@/constants/kinds'
import { eventStore } from '@/stores/events/event.store'
import type { FeedStore } from '@/stores/feeds/feed.store'
import { observer } from 'mobx-react-lite'
import { FollowSetChip } from '../../Lists/FollowSets/FollowSetChip'
import { FeedHeaderBase } from './FeedHeaderBase'

type Props = {
  feed: FeedStore
}

export const FeedHeaderFollowSet = observer(function FeedHeaderFollowSet(props: Props) {
  const { feed } = props
  const author = feed.filter.authors?.[0] || ''
  const d = feed.filter['#d']?.[0] || ''
  const kind = feed.filter.kinds?.[0] || Kind.Follows
  const events = d
    ? eventStore.getEventsByKindPubkeyTagValue(kind, author, 'd', d)
    : eventStore.getEventsByKindPubkey(kind, author)

  return (
    <FeedHeaderBase
      feed={feed}
      leading={
        <Stack gap={2}>
          <FollowSetChip events={events} />
        </Stack>
      }
    />
  )
})
