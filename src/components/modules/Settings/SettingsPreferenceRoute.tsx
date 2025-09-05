import { SettingsClientTag } from '@/components/modules/Settings/SettingsClientTag'
import { SettingsMaxRelaysOutbox } from '@/components/modules/Settings/SettingsMaxRelaysOutbox'
import { SettingsNIP05 } from '@/components/modules/Settings/SettingsNIP05'
import { SettingsSubHeader } from '@/components/modules/Settings/SettingsSubHeader'
import { SettingsTheme } from '@/components/modules/Settings/SettingsTheme'
import { Stack } from '@/components/ui/Stack/Stack'
import { SettingsContent } from './SettingsContent'
import { Text } from '@/components/ui/Text/Text'
import { Divider } from '@/components/ui/Divider/Divider'
import { css } from 'react-strict-dom'
import { spacing } from '@/themes/spacing.stylex'
import { SettingsLayout } from './SettingsLayout'

export const SettingsPreferencesRoute = () => {
  return (
    <Stack grow horizontal={false}>
      <Stack sx={styles.header}>
        <Text variant='title' size='lg'>
          General
        </Text>
      </Stack>
      <Divider />
      <Stack horizontal={false} gap={1} align='flex-start' sx={styles.content}>
        <SettingsSubHeader>Theme</SettingsSubHeader>
        <SettingsTheme />
      </Stack>
      <br />
      <Stack horizontal={false} gap={2} align='flex-start'>
        <SettingsNIP05 />
        <SettingsMaxRelaysOutbox />
        <SettingsContent />
        <SettingsClientTag />
        <SettingsLayout />
      </Stack>
    </Stack>
  )
}

const styles = css.create({
  header: {
    paddingBlock: spacing.padding2,
    paddingInline: spacing.padding4,
  },
  content: {
    paddingTop: spacing.padding2,
  },
})
