import { Chip, Tooltip } from "@mui/material"
import { IconServerBolt } from "@tabler/icons-react"
import { observer } from "mobx-react-lite"
import { relayStore } from "stores/nostr/relays.store"
import { authStore } from "stores/ui/auth.store"

type Props = {
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void
}

export const RelayIconButton = observer(function RelayIconButton(props: Props) {
  return (
    <Tooltip arrow title='Configure Relays'>
      <span>
        {authStore.pubkey && (
          <Chip
            onClick={props.onClick}
            icon={<IconServerBolt strokeWidth='1.5' />}
            sx={{ minWidth: 24, span: { pr: 1 } }}
            label={`${relayStore.myConnectedRelays.length} / ${relayStore.myRelays.length}`}
          />
        )}
        {!authStore.pubkey && (
          // Since the user isn't logged, just show the connected relays from the pool.
          <Chip
            onClick={props.onClick}
            icon={<IconServerBolt strokeWidth='1.5' />}
            sx={{ minWidth: 24, span: { pr: 1 } }}
            label={`${relayStore.connected.length} / ${relayStore.list.length}`}
          />
        )}
      </span>
    </Tooltip>
  )
})
