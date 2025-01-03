import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { spacing } from '@/themes/spacing.stylex'
import { css } from 'react-strict-dom'

// TODO
export const SettingsStorageRoute = () => {
  return (
    <Stack sx={styles.root}>
      <Text size='md' variant='headline'>
        Storage
      </Text>
    </Stack>
  )
}

const styles = css.create({
  root: {
    padding: spacing.padding4,
  },
})
