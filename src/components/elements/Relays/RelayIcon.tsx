import { IconServerBolt, IconServerOff } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { relayStore } from 'stores/nostr/relays.store'
import { html, css } from 'react-strict-dom'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'

type Props = {
  url: string
}

const RelayIcon = observer(function RelayIcon(props: Props) {
  const relay = relayStore.pool.relays.get(props.url)
  const connected = relay?.connected || false
  return (
    <html.span style={connected ? styles.connected : styles.disconnected}>
      <Tooltip cursor='arrow' text='Connected'>
        <span>{connected && <IconServerBolt color='currentColor' size={18} strokeWidth='1.6' />}</span>
      </Tooltip>
      <Tooltip cursor='arrow' text='Not connected'>
        <span>{!connected && <IconServerOff color='currentColor' size={18} strokeWidth='1.6' />}</span>
      </Tooltip>
    </html.span>
  )
})

const styles = css.create({
  connected: {
    color: colors.green9,
  },
  disconnected: {
    color: colors.red6,
  },
})

export default RelayIcon
