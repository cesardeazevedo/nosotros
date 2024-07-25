import { Box } from "@mui/material"
import { IconServerBolt, IconServerOff } from "@tabler/icons-react"
import { observer } from "mobx-react-lite"
import { relayStore } from "stores/nostr/relays.store"
import Tooltip from "../Layouts/Tooltip"

type Props = {
  url: string
}

const RelayIcon = observer(function RelayIcon(props: Props) {
  const relay = relayStore.pool.relays.get(props.url)
  const connected = relay?.connected || false
  return (
    <Box color={connected ? 'success.main' : 'info'} sx={{ ml: 1, display: 'inline-flex' }}>
      <Tooltip arrow title='Connected'>
        <span>
          {connected && <IconServerBolt color='currentColor' size={20} strokeWidth='1.6' />}
        </span>
      </Tooltip>
      <Tooltip arrow title='Not connected'>
        <span>
          {!connected && <IconServerOff color='currentColor' size={20} strokeWidth='1.6' />}
        </span>
      </Tooltip>
    </Box>
  )
})

export default RelayIcon
