import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { RelayDiscoveryModule } from '@/stores/modules/relay.discovery.module'
import { palette } from '@/themes/palette.stylex'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'

type Props = {
  module: RelayDiscoveryModule
}

export const RelayDiscoveryTitle = observer(function RelayDiscoveryTitle(props: Props) {
  const { module } = props
  return (
    <Stack grow gap={0.5}>
      <Text variant='headline' size='sm'>
        Relay Discovery
      </Text>
      <Text variant='title' size='md' sx={styles.total}>
        {module.selected && `(${module.getTotal(module.selected)})`}
      </Text>
    </Stack>
  )
})

const styles = css.create({
  total: {
    color: palette.onSurfaceVariant,
  },
})
