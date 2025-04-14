import { RelaySetsChip } from '@/components/elements/Relays/RelaySetsChip'
import { Stack } from '@/components/ui/Stack/Stack'
import type { FeedStore } from '@/stores/feeds/feed.store'
import { observer } from 'mobx-react-lite'
import { FeedHeaderBase } from './FeedHeaderBase'

type Props = {
  feed: FeedStore
}

export const FeedHeaderRelaySets = observer(function FeedHeaderRelaySets(props: Props) {
  const { feed } = props
  return (
    <FeedHeaderBase
      feed={feed}
      leading={
        <Stack gap={2}>
          {feed.context.relaySets?.length === 1 && <RelaySetsChip relaySet={feed.context.relaySets[0]} />}
        </Stack>
      }
    />
  )
})
