import { Button } from '@/components/ui/Button/Button'
import { Chip } from '@/components/ui/Chip/Chip'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import { useCurrentPubkey } from '@/hooks/useRootStore'
import { metadataSymbol, type NostrEventRelayDiscovery } from '@/nostr/types'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { IconCoinBitcoin, IconLock } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { css, html } from 'react-strict-dom'
import { RelayChip } from '../Relays/RelayChip'
import { RelayFriendsList } from '../Relays/RelayFriendsList'

type Props = {
  event: NostrEventRelayDiscovery
}

export const RelayDiscoveryRow = (props: Props) => {
  const { event } = props
  const pubkey = useCurrentPubkey()
  const root = css.props(styles.root)
  const td = css.props(styles.cell)
  const tags = event[metadataSymbol].tags
  const relay = formatRelayUrl(tags.d?.[0][1] || '')
  const open = tags['rtt-open']?.[0][1]
  const authRequired = tags.R?.flat().find((x) => x === 'auth') || false
  const paymentRequired = tags.R?.flat().find((x) => x === 'payment') || false
  return (
    <tr key={event.id} {...root}>
      <td {...td}>
        <Stack gap={0.5}>
          <RelayChip icon={<></>} url={relay} />
          {authRequired && (
            <Tooltip text='Authentication Required' enterDelay={0}>
              <Chip icon={<IconLock size={18} strokeWidth='1.5' />} label='' />
            </Tooltip>
          )}
          {paymentRequired && (
            <Tooltip text='Payment Required' enterDelay={0}>
              <Chip icon={<IconCoinBitcoin size={18} strokeWidth='1.5' />} label='' />
            </Tooltip>
          )}
        </Stack>
      </td>
      {pubkey && (
        <td {...td} align='right'>
          <RelayFriendsList relay={relay} />
        </td>
      )}
      <td {...td} align='left'>
        <Stack justify='flex-start' gap={1}>
          <html.span style={styles.circle} />
          <Text size='md' sx={styles.ms}>
            {open}ms
          </Text>
        </Stack>
      </td>
      <td {...td} align='right'>
        <Stack gap={1} justify='flex-end'>
          <Link to='/' search={{ relay }}>
            <Button variant='filledTonal'>Explore</Button>
          </Link>
        </Stack>
      </td>
    </tr>
  )
}

const styles = css.create({
  root: {
    borderBottom: '1px solid',
    borderColor: palette.outlineVariant,
  },
  cell: {
    paddingInline: spacing.padding2,
    paddingBlock: spacing.padding1,
  },
  circle: {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: shape.full,
    backgroundColor: colors.green6,
  },
  ms: {
    fontFamily: 'monospace',
  },
})
