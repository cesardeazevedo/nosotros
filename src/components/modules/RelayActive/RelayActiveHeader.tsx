import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useActiveRelays, useConnectedRelays } from '@/hooks/useRelays'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css } from 'react-strict-dom'

export const RelayActiveHeader = memo(function RelayActiveHeader() {
  const relays = useActiveRelays()
  const connected = useConnectedRelays()
  return (
    <Stack gap={0.5} sx={styles.header} justify='space-between'>
      <Stack gap={1}>
        <Text variant='title' size='md'>
          Active Relays ({connected.length}/{relays.length})
        </Text>
      </Stack>
    </Stack>
  )
})

const styles = css.create({
  header: {
    padding: spacing.padding2,
    paddingInline: spacing.padding3,
  },
})
