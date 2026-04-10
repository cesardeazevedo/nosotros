import { Button } from '@/components/ui/Button/Button'
import { Chip } from '@/components/ui/Chip/Chip'
import { IconButton } from '@/components/ui/IconButton/IconButton'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { Tooltip } from '@/components/ui/Tooltip/Tooltip'
import { useRelayInfo } from '@/hooks/query/useRelayInfo'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useMobile, useSM } from '@/hooks/useMobile'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconChevronDown, IconChevronRight, IconCoinBitcoin, IconLock } from '@tabler/icons-react'
import { memo, useState } from 'react'
import { css } from 'react-strict-dom'
import { LinkRelayFeed } from '../Links/LinkRelayFeed'
import { RelayChip } from '../Relays/RelayChip'
import { RelayFriendsList } from '../Relays/RelayFriendsList'
import { RelayDescription } from './RelayDescription'
import { RelayIcon } from './RelayIcon'
import { RelayLatency } from './RelayLatency'
import { RelayRowDetails } from './RelayRowDetails'

export type Props = {
  relay: string
  relayPubkey?: string
  rtt?: number | string
}

export const RelayTableRow = memo(function RelayTableRow(props: Props) {
  const { relay, rtt } = props
  const pubkey = useCurrentPubkey()
  const [open, setOpen] = useState(false)
  const root = css.props(styles.root)
  const td = css.props(styles.cell)
  const { data: info } = useRelayInfo(relay)
  const isMD = useMobile()
  const isSM = useSM()
  return (
    <>
      <tr {...root} onClick={(e) => {
        e.stopPropagation()
        setOpen(!open)
      }}>
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
              <RelayDescription description={info?.description} />
            </Stack>
          </Stack>
        </td>
        <td {...td}>
          <Stack gap={0.5} align='flex-start'>
            <RelayChip
              url={relay}
              icon={false}
              renderDisconnectedIcon={false}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            />
            {info?.limitation?.auth_required && (
              <Tooltip text='Authentication Required' enterDelay={0}>
                <Chip icon={<IconLock size={18} strokeWidth='1.5' />} label='' />
              </Tooltip>
            )}
            {info?.limitation?.payment_required && (
              <Tooltip text='Payment Required' enterDelay={0}>
                <Chip icon={<IconCoinBitcoin size={18} strokeWidth='1.5' />} label='' />
              </Tooltip>
            )}
          </Stack>
        </td>
        {pubkey && !isMD && (
          <td {...td} align='right'>
            <RelayFriendsList url={relay} />
          </td>
        )}
        {rtt && !isSM && (
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
