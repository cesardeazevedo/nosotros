import { Button } from '@/components/ui/Button/Button'
import { Chip } from '@/components/ui/Chip/Chip'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useCurrentPubkey } from '@/hooks/useRootStore'
import { relaysStore } from '@/stores/relays/relays.store'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronDown, IconChevronRight, IconCoinBitcoin, IconLock } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { css } from 'react-strict-dom'
import { LinkRelayFeed } from '../Links/LinkRelayFeed'
import { RelayChip } from '../Relays/RelayChip'
import { RelayFriendsList } from '../Relays/RelayFriendsList'
import { RelayIcon } from './RelayIcon'
import { RelayLatency } from './RelayLatency'
import { RelayRowDetails } from './RelayRowDetails'

export type Props = {
  relay: string
  relayPubkey?: string
  rtt?: number | string
  authRequired?: boolean
  paymentRequired?: boolean
}

export const RelayTableRow = observer(function RelayTableRow(props: Props) {
  const { relay, rtt, authRequired = false, paymentRequired = false } = props
  const pubkey = useCurrentPubkey()
  const [open, setOpen] = useState(false)
  const root = css.props(styles.root)
  const td = css.props(styles.cell)
  const info = relaysStore.getInfo(relay)
  return (
    <>
      <tr {...root} onClick={() => setOpen(!open)}>
        <td {...td}>
          <Stack sx={styles.breakWord} gap={2}>
            <IconButton
              size='sm'
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setOpen((prev) => !prev)
              }}>
              {open ? <IconChevronDown /> : <IconChevronRight />}
            </IconButton>
            <RelayIcon url={relay} />
            <Stack horizontal={false}>
              <Text variant='title' size='md'>
                {info?.name}
              </Text>
              <Text variant='body' size='sm'>
                {info?.description}
              </Text>
            </Stack>
          </Stack>
        </td>
        <td {...td}>
          <Stack gap={0.5} align='flex-start'>
            <RelayChip
              url={relay}
              icon={false}
              renderDisconnectedIcon={false}
              onClick={() => setOpen((prev) => !prev)}
            />
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
        {rtt && (
          <td {...td} align='left'>
            <RelayLatency value={rtt} />
          </td>
        )}
        <td {...td} align='right'>
          <Stack gap={1} justify='flex-end'>
            <LinkRelayFeed url={relay}>
              <Button variant='filledTonal'>Explore</Button>
            </LinkRelayFeed>
          </Stack>
        </td>
      </tr>
      {open && (
        <tr {...root}>
          <td colSpan={5}>
            <RelayRowDetails relay={relay} />
          </td>
        </tr>
      )}
    </>
  )
})

const styles = css.create({
  root: {
    cursor: 'pointer',
    borderBottom: '1px solid',
    borderColor: palette.outlineVariant,
    backgroundColor: {
      default: 'transparent',
      ':hover': 'rgba(125, 125, 135, 0.05)',
    },
  },
  cell: {
    paddingInline: spacing.padding2,
    paddingBlock: spacing.padding1,
  },
  breakWord: {
    wordBreak: 'break-word',
  },
})
