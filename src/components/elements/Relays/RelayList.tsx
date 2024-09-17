import { Stack } from '@/components/ui/Stack/Stack'
import type { UserRelayDB } from 'db/types'
import { observer } from 'mobx-react-lite'
import RelayUserChip from './RelayUserChip'

type Props = {
  relays: UserRelayDB[]
}

const RelayList = observer(function RelayList(props: Props) {
  return (
    <Stack horizontal={false} gap={1} align='flex-start'>
      {props.relays.map((userRelay) => (
        <RelayUserChip key={userRelay.relay} userRelay={userRelay} />
      ))}
    </Stack>
  )
})

export default RelayList
