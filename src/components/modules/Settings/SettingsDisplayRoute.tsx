import { SettingsSubHeader } from '@/components/elements/Settings/SettingsSubHeader'
import { SettingsTheme } from '@/components/elements/Settings/SettingsTheme'
import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import { css } from 'react-strict-dom'

export const SettingsDisplayRoute = () => {
  return (
    <Stack horizontal={false} gap={1} sx={styles.root}>
      <SettingsSubHeader>Appearance</SettingsSubHeader>
      <SettingsTheme />
    </Stack>
  )
}

const styles = css.create({
  root: {
    padding: spacing.padding6,
  },
  header: {
    paddingLeft: spacing.padding2,
  },
  menu: {
    width: '100%',
    maxWidth: 500,
  },
})
