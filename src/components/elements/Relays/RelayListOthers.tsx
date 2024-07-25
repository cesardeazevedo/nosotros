import type { Relay } from 'core/Relay'
import { observer } from 'mobx-react-lite'
import RelayChip from './RelayChip'
import { Box } from '@mui/material'

type Props = {
  relays: Relay[]
}

const RelayListOthers = observer(function RelayListOthers(props: Props) {
  return (
    <Box sx={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      {props.relays.map((relay) => (
        <RelayChip key={relay.url} relay={relay} />
      ))}
    </Box>
  )
})

export default RelayListOthers
