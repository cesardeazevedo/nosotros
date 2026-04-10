import { UserAvatar } from '@/components/elements/User/UserAvatar'
import { MenuItem } from '@/components/ui/MenuItem/MenuItem'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { RelayMonitorFeed } from '@/hooks/state/useRelayMonitorFeed'
import { useUserState } from '@/hooks/state/useUser'
import { spacing } from '@/themes/spacing.stylex'
import { css } from 'react-strict-dom'

type Props = {
  feed: RelayMonitorFeed
}

const RelayMonitorOverviewItem = (props: { feed: RelayMonitorFeed; pubkey: string; total: number }) => {
  const { feed, pubkey, total } = props
  const user = useUserState(pubkey)

  return (
    <MenuItem
      interactive
      selected={feed.selected === pubkey}
      size='sm'
      leadingIcon={<UserAvatar pubkey={pubkey} size='sm' />}
      label={user?.displayName || pubkey}
      trailing={
        <Text variant='title' size='sm' sx={styles.total}>
          {total}
        </Text>
      }
      onClick={() => feed.setSelectedMonitor(pubkey)}
    />
  )
}

export const RelayMonitorOverview = (props: Props) => {
  const { feed } = props

  if (!feed.listMonitors.length) {
    return null
  }

  return (
    <Stack horizontal={false} gap={0.5}>
      <Text variant='label' size='sm' sx={styles.subtitle}>
        Relay Overview
      </Text>
      {feed.listMonitors.map((monitor) => (
        <RelayMonitorOverviewItem key={monitor} feed={feed} pubkey={monitor} total={feed.getByMonitor(monitor).length} />
      ))}
    </Stack>
  )
}

const styles = css.create({
  subtitle: {
    paddingInline: spacing.padding2,
    paddingTop: spacing['padding0.5'],
    paddingBottom: spacing['padding0.5'],
  },
  total: {
    minWidth: 20,
    textAlign: 'right',
    paddingInlineStart: spacing.padding1,
  },
})
