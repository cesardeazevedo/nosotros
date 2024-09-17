import type { Relay } from 'core/Relay'
import { observer } from 'mobx-react-lite'
import RelayChip from './RelayChip'
import { Stack } from '@/components/ui/Stack/Stack'

type Props = {
  relays: Relay[]
}

const RelayListOthers = observer(function RelayListOthers(props: Props) {
  return (
    <Stack horizontal={false} gap={0.5} align='flex-start'>
      {props.relays.map((relay) => (
        <RelayChip key={relay.url} relay={relay} />
      ))}
    </Stack>
  )
})

export default RelayListOthers
