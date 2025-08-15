import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { RelayDiscoveryFeed } from '@/hooks/state/useRelayDiscoveryFeed'
import { palette } from '@/themes/palette.stylex'
import { memo } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  feed: RelayDiscoveryFeed
}

export const RelayDiscoveryTitle = memo(function RelayDiscoveryTitle(props: Props) {
  const { feed } = props
  return (
    <Stack grow gap={0.5}>
      <Text variant='headline' size='sm'>
        Relay Discovery
      </Text>
      <Text variant='title' size='md' sx={styles.total}>
        {`(${feed.getTotal()})`}
      </Text>
    </Stack>
  )
})

const styles = css.create({
  total: {
    color: palette.onSurfaceVariant,
  },
})
