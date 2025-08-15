import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useRelay } from '@/hooks/useRelays'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconAntennaBars1, IconAntennaBars5 } from '@tabler/icons-react'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  url: string
}

export const RelayConnectedIcon = memo(function RelayConnectedIcon(props: Props) {
  const { url } = props
  const relay = useRelay(url)
  const active = !!relay
  const connected = relay?.connected || false
  if (active) {
    if (connected) {
      return (
        <Tooltip cursor='arrow' text='Connected' placement='top'>
          <html.span style={styles.connected}>
            <IconAntennaBars5 color='currentColor' size={22} strokeWidth='1.8' />
          </html.span>
        </Tooltip>
      )
    } else {
      return (
        <Tooltip cursor='arrow' text={active ? `Couldn't establish connection` : 'Inactive'} placement='top'>
          <html.span style={styles.disconnected}>
            <IconAntennaBars1 color='currentColor' size={22} strokeWidth='1.8' />
          </html.span>
        </Tooltip>
      )
    }
  }
  return undefined
})

const styles = css.create({
  connected: {
    color: colors.green7,
  },
  disconnected: {
    color: colors.red5,
  },
})
