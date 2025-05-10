import { SettingsClientTag } from '@/components/modules/Settings/SettingsClientTag'
import { SettingsContent } from '@/components/modules/Settings/SettingsContent'
import { SettingsMaxRelaysOutbox } from '@/components/modules/Settings/SettingsMaxRelaysOutbox'
import { SettingsMediaStorage } from '@/components/modules/Settings/SettingsMediaStorage'
import { SettingsNIP05 } from '@/components/modules/Settings/SettingsNIP05'
import { SettingsSubHeader } from '@/components/modules/Settings/SettingsSubHeader'
import { SettingsTheme } from '@/components/modules/Settings/SettingsTheme'
import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import { css } from 'react-strict-dom'
import { SettingsRelayAuth } from './SettingsRelaysAuth'

export const SettingsPreferencesRoute = () => {
  return (
    <Stack horizontal={false} gap={4} sx={styles.root} align='flex-start'>
      <Stack horizontal={false} gap={1}>
        <SettingsSubHeader>Theme</SettingsSubHeader>
        <SettingsTheme />
      </Stack>
      <Stack horizontal={false} gap={1} align='flex-start'>
        <SettingsSubHeader>Network Settings</SettingsSubHeader>
        <SettingsNIP05 />
        <br />
        <SettingsMaxRelaysOutbox />
        <br />
        <SettingsRelayAuth />
      </Stack>
      <Stack horizontal={false} gap={1}>
        <SettingsSubHeader>Post Settings</SettingsSubHeader>
        <SettingsClientTag />
      </Stack>
      <Stack horizontal={false} gap={1} align='flex-start' justify='flex-start'>
        <SettingsSubHeader>Upload Settings</SettingsSubHeader>
        <SettingsMediaStorage />
      </Stack>
      <Stack horizontal={false} gap={1}>
        <SettingsSubHeader>Content Settings</SettingsSubHeader>
        <SettingsContent />
      </Stack>
    </Stack>
  )
}

const styles = css.create({
  root: {
    padding: spacing.padding2,
    width: '100%',
  },
  header: {
    paddingLeft: spacing.padding2,
  },
  menu: {
    width: '100%',
    // maxWidth: 500,
  },
})
