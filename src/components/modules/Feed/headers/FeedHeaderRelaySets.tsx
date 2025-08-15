import { RelaySetsChip } from '@/components/elements/Relays/RelaySetsChip'
import { Stack } from '@/components/ui/Stack/Stack'
import type { FeedState } from '@/hooks/state/useFeed'
import { FeedHeaderBase } from './FeedHeaderBase'

type Props = {
  feed: FeedState
}

export const FeedHeaderRelaySets = function FeedHeaderRelaySets(props: Props) {
  const { feed } = props
  return (
    <FeedHeaderBase
      feed={feed}
      leading={
        <Stack gap={2}>
          {feed.options.ctx.relaySets?.length === 1 && <RelaySetsChip relaySet={feed.options.ctx.relaySets[0]} />}
        </Stack>
      }
    />
  )
}
