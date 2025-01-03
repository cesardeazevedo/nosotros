import { Stack } from '@/components/ui/Stack/Stack'
import type { RelayStore } from '@/stores/relays/relay'
import { observer } from 'mobx-react-lite'
import { RelayChip } from './RelayChip'

type Props = {
  relays: RelayStore[]
}

export const RelayList = observer(function RelayListOthers(props: Props) {
  return (
    <Stack horizontal={false} gap={0.5} align='flex-start'>
      {props.relays.map(({ url }) => (
        <RelayChip key={url} url={url} />
      ))}
    </Stack>
  )
})
