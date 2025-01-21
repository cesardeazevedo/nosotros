import { Stack } from '@/components/ui/Stack/Stack'
import type { UserRelay } from '@/nostr/types'
import { observer } from 'mobx-react-lite'
import { RelayUserChip } from './RelayUserChip'

type Props = {
  relays?: UserRelay[]
}

export const RelayUserChipList = observer(function RelayUserChipList(props: Props) {
  const { relays = [] } = props
  return (
    <Stack horizontal={false} gap={0.5} align='flex-start'>
      {relays.map((userRelay) => (
        <RelayUserChip key={userRelay.relay} userRelay={userRelay} />
      ))}
    </Stack>
  )
})
