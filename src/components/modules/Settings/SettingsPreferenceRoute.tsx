import { SettingsClientTag } from '@/components/modules/Settings/SettingsClientTag'
import { SettingsMaxRelaysOutbox } from '@/components/modules/Settings/SettingsMaxRelaysOutbox'
import { SettingsNIP05 } from '@/components/modules/Settings/SettingsNIP05'
import { SettingsSubHeader } from '@/components/modules/Settings/SettingsSubHeader'
import { SettingsTheme } from '@/components/modules/Settings/SettingsTheme'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { spacing } from '@/themes/spacing.stylex'
import { css } from 'react-strict-dom'
import { SettingsAutoPlay } from './SettingsAutoPlay'
import { SettingsDelayBroadcast } from './SettingsDelayBroadcast'
import { SettingsLayout } from './SettingsLayout'
import { Paper } from '@/components/ui/Paper/Paper'

export const SettingsPreferencesRoute = () => {
  return (
    <Stack grow horizontal={false} sx={styles.container}>
      <Stack sx={styles.header}>
        <Text variant='title' size='lg'>
          General
        </Text>
      </Stack>
      <Divider />
      <Stack horizontal={false} sx={styles.root}>
        <Stack horizontal={false} gap={1} align='flex-start' sx={styles.content}>
          <SettingsSubHeader>Theme</SettingsSubHeader>
          <SettingsTheme />
        </Stack>
        <br />
        <Paper outlined sx={styles.paper}>
          <Stack horizontal={false} gap={2} align='flex-start'>
            <SettingsNIP05 />
            <SettingsMaxRelaysOutbox />
            <SettingsDelayBroadcast />
            <SettingsAutoPlay />
            <SettingsClientTag />
            <SettingsLayout />
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  )
}

const styles = css.create({
  container: {
    height: '100%',
  },
  root: {
    width: '100%',
    overflowY: 'auto',
    paddingBottom: spacing.padding3,
    paddingInline: spacing.padding2,
  },
  paper: {
    width: '100%',
  },
  header: {
    paddingBlock: spacing.padding2,
    paddingInline: spacing.padding4,
  },
  content: {
    paddingTop: spacing.padding2,
  },
})
