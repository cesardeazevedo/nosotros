import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { relaysStore } from '@/stores/relays/relays.store'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconAntennaBars1, IconAntennaBars5 } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css, html } from 'react-strict-dom'

type Props = {
  url: string
}

export const RelayConnectedIcon = observer(function RelayConnectedIcon(props: Props) {
  const relay = relaysStore.relays.get(props.url)
  const connected = relay?.connected || false
  if (connected) {
    return (
      <Tooltip cursor='arrow' text='Connected' placement='left'>
        <html.span style={styles.connected}>
          <IconAntennaBars5 color='currentColor' size={22} strokeWidth='1.8' />
        </html.span>
      </Tooltip>
    )
  }
  return (
    <Tooltip cursor='arrow' text={`Couldn't establish connection`} placement='left'>
      <html.span style={styles.disconnected}>
        <IconAntennaBars1 color='currentColor' size={22} strokeWidth='1.8' />
      </html.span>
    </Tooltip>
  )
})

const styles = css.create({
  connected: {
    color: colors.green7,
  },
  disconnected: {
    color: colors.red5,
  },
})
