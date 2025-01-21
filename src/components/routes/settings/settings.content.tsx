import { SettingsClientTag } from '@/components/elements/Settings/SettingsClientTag'
import { SettingsContent } from '@/components/elements/Settings/SettingsContent'
import { SettingsSubHeader } from '@/components/elements/Settings/SettingsSubHeader'
import { MenuList } from '@/components/ui/MenuList/MenuList'
import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import { css } from 'react-strict-dom'

export const SettingsContentRoute = () => {
  return (
    <Stack gap={1} horizontal={false} sx={styles.root}>
      <MenuList sx={styles.menu} elevation={0} surface='surfaceContainerLowest'>
        <SettingsClientTag />
        <br />
        <SettingsSubHeader>Content Settings</SettingsSubHeader>
        <SettingsContent />
      </MenuList>
    </Stack>
  )
}

const styles = css.create({
  root: {
    padding: spacing.padding2,
    width: '100%',
  },
  menu: {
    width: '100%',
    //maxWidth: 400,
  },
})
