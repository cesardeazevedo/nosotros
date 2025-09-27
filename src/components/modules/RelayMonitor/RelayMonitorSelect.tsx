import { UserChip } from '@/components/elements/User/UserChip'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import type { RelayMonitorFeed } from '@/hooks/state/useRelayMonitorFeed'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  feed: RelayMonitorFeed
}

export const RelayMonitorSelect = memo(function RelayMonitorSelect(props: Props) {
  const { feed } = props
  return (
    <>
      <Stack sx={styles.root} gap={0.5}>
        {feed.listMonitors.map((monitor) => (
          <UserChip
            selected={feed.selected === monitor}
            pubkey={monitor}
            onClick={() => feed.setSelectedMonitor(monitor)}
          />
        ))}
      </Stack>
      <Divider />
    </>
  )
})

const styles = css.create({
  root: {
    padding: spacing.padding1,
  },
})
