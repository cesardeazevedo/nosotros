import { Chip } from '@/components/ui/Chip/Chip'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { shape } from '@/themes/shape.stylex'
import { IconServerBolt } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'
import type { StrictClickEvent } from 'react-strict-dom/dist/types/StrictReactDOMProps'
import { relayStore } from 'stores/nostr/relays.store'
import { authStore } from 'stores/ui/auth.store'

type Props = {
  onClick?: (event: StrictClickEvent) => void
}

export const RelayIconButton = observer(function RelayIconButton(props: Props) {
  return (
    <Tooltip cursor='arrow' text='Configure Relays'>
      <span>
        {authStore.pubkey && (
          <Chip
            onClick={props.onClick}
            icon={<IconServerBolt strokeWidth='1.5' />}
            sx={styles.chip}
            label={`${relayStore.myConnectedRelays.length} / ${relayStore.myRelays.length}`}
          />
        )}
        {!authStore.pubkey && (
          // Since the user isn't logged, just show the connected relays from the pool.
          <Chip
            onClick={props.onClick}
            icon={<IconServerBolt strokeWidth='1.5' />}
            sx={styles.chip}
            label={`${relayStore.connected.length} / ${relayStore.list.length}`}
          />
        )}
      </span>
    </Tooltip>
  )
})

const styles = css.create({
  chip: {
    borderRadius: shape.full,
  },
})
