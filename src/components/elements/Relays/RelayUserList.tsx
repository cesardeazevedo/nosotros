import { Stack } from '@/components/ui/Stack/Stack'
import type { UserRelayDB } from '@/nostr/nips/nip65.relaylist'
import { observer } from 'mobx-react-lite'
import { RelayUserChip } from './RelayUserChip'

type Props = {
  relays?: UserRelayDB[]
  renderAvatar?: boolean
}

export const RelayUserList = observer(function RelayList(props: Props) {
  const { relays = [] } = props
  return (
    <Stack horizontal={false} gap={0.5} align='flex-start'>
      {relays.map((userRelay) => (
        <RelayUserChip key={userRelay.relay} userRelay={userRelay} />
      ))}
    </Stack>
  )
})
