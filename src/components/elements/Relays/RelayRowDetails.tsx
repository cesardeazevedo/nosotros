import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useRelativeDate } from '@/hooks/useRelativeDate'
import { relaysStore } from '@/stores/relays/relays.store'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { css } from 'react-strict-dom'
import { UserAvatar } from '../User/UserAvatar'
import { UserName } from '../User/UserName'
import { RelayDescription } from './RelayDescription'
import { RelayFriendsList } from './RelayFriendsList'
import { RelayLatency } from './RelayLatency'

type Props = {
  relay: string
  latency?: string | number
}

export const RelayRowDetails = observer(function RelayRowDetails(props: Props) {
  const { relay, latency } = props
  const info = relaysStore.getInfo(relay)

  const software = useMemo(() => {
    try {
      if (info?.software) {
        const url = new URL(info.software)
        return `${url.hostname}${url.pathname}#${info.version}`
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return ''
    }
  }, [])

  const hasAuthor = !!info?.pubkey && info?.pubkey.length === 64
  const relayStats = relaysStore.getByUrl(relay)
  const lastConnected = relayStats?.stats.lastConnected
  const [lastConnectedText] = useRelativeDate(lastConnected || 0, 'long')
  return (
    <Stack horizontal sx={styles.root} justify='space-between' align='flex-start' gap={2}>
      <Stack horizontal={false} gap={1} sx={styles.section}>
        <Stack horizontal={false}>
          <Text variant='title' size='lg'>
            {info?.name}
          </Text>
          <RelayDescription variant='title' size='sm' description={info?.description} />
          {hasAuthor && (
            <Text variant='title' size='sm'>
              <Stack gap={1}>
                owner:
                <UserAvatar size='xs' pubkey={info.pubkey} /> <UserName pubkey={info.pubkey} />
              </Stack>
            </Text>
          )}
        </Stack>
        <Stack horizontal={false}>
          <Text variant='title' size='sm'>
            Software: {software}
          </Text>
          <Text variant='title' size='sm'>
            NIPs: {JSON.stringify(info?.supported_nips || [])}
          </Text>
        </Stack>
      </Stack>
      <Stack horizontal={false} gap={3}>
        <Stack horizontal gap={3} align='flex-start' wrap>
          <Stack horizontal={false}>
            <Text size='lg'>events</Text>
            <Text variant='title' size='sm'>
              {relayStats?.stats.events || 0}
            </Text>
          </Stack>
          <Stack horizontal={false}>
            <Text size='lg'>connects</Text>
            <Text variant='title' size='sm'>
              {relayStats?.stats.connects || 0}
            </Text>
          </Stack>
          <Stack horizontal={false}>
            <Text size={'lg'}>last connected</Text>
            <Text variant='title' size='sm'>
              {lastConnected ? lastConnectedText : 'never'}
            </Text>
          </Stack>
          {latency && (
            <Stack horizontal={false}>
              <Text size={'lg'}>latency</Text>
              <RelayLatency value={latency} />
            </Stack>
          )}
          <Stack horizontal={false}>
            <Text size={'lg'}>following</Text>
            <RelayFriendsList relay={relay} />
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  root: {
    width: '100%',
    cursor: 'default',
    paddingBlock: spacing.padding2,
    paddingInline: spacing.padding2,
    backgroundColor: palette.surfaceContainerLow,
  },
  section: {
    maxWidth: 350,
  },
  description: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    WebkitLineClamp: 2,
    boxOrient: 'vertical',
    WebkitBoxOrient: 'vertical',
    display: '-webkit-box',
  },
})
