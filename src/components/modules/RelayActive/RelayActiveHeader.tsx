import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { relaysStore } from '@/stores/relays/relays.store'
import { spacing } from '@/themes/spacing.stylex'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'

export const RelayActiveHeader = observer(function RelayActiveHeader() {
  return (
    <Stack gap={0.5} sx={styles.header} justify='space-between'>
      <Stack gap={1}>
        <Text variant='title' size='md'>
          Active Relays ({relaysStore.connected.length}/{relaysStore.list.length})
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
