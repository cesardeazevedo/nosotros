import { Stack } from '@/components/ui/Stack/Stack'
import { Kind } from '@/constants/kinds'
import { useEventAddress } from '@/hooks/query/useQueryBase'
import type { FeedState } from '@/hooks/state/useFeed'
import { FollowSetChip } from '../../Lists/FollowSets/FollowSetChip'
import { FeedHeaderBase } from './FeedHeaderBase'

type Props = {
  feed: FeedState
}

export const FeedHeaderFollowSet = function FeedHeaderFollowSet(props: Props) {
  const { feed } = props
  const author = feed.filter.authors?.[0] || ''
  const d = feed.filter['#d']?.[0] || ''
  const kind = feed.filter.kinds?.[0] || Kind.Follows
  const event = useEventAddress(kind, author, d)

  return (
    <FeedHeaderBase feed={feed} leading={<Stack gap={2}>{event.data && <FollowSetChip event={event.data} />}</Stack>} />
  )
}
