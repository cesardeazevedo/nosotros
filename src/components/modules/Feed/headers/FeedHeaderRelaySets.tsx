import { RelaySetsChip } from '@/components/elements/Relays/RelaySetsChip'
import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { skeletonTokens } from '@/components/ui/Skeleton/Skeleton.stylex'
import { Stack } from '@/components/ui/Stack/Stack'
import { Kind } from '@/constants/kinds'
import { useEventAddress } from '@/hooks/query/useQueryBase'
import type { FeedState } from '@/hooks/state/useFeed'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { css } from 'react-strict-dom'
import { FeedHeaderBase } from './FeedHeaderBase'

type Props = {
  feed: FeedState
}

export const FeedHeaderRelaySets = function FeedHeaderRelaySets(props: Props) {
  const { feed } = props
  const author = feed.filter.authors?.[0] || ''
  const d = feed.filter['#d']?.[0] || ''
  const event = useEventAddress(Kind.RelaySets, author, d)
  return (
    <FeedHeaderBase
      feed={feed}
      leading={
        <Stack gap={2}>
          {event.data ? <RelaySetsChip event={event.data} /> : <Skeleton variant='rectangular' sx={styles.loading} />}
        </Stack>
      }
    />
  )
}

const styles = css.create({
  loading: {
    width: 120,
    height: 32,
    borderRadius: shape.md,
    [skeletonTokens.containerColor]: palette.surfaceContainerLow,
  },
})
