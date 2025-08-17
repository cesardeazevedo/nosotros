import { CenteredContainer } from '@/components/elements/Layouts/CenteredContainer'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { SettingsTabs } from '@/components/modules/Settings/SettingsTabs'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useMobile } from '@/hooks/useMobile'
import { spacing } from '@/themes/spacing.stylex'
import { Outlet } from '@tanstack/react-router'
import { memo } from 'react'
import { css } from 'react-strict-dom'

export const SettingsRoute = memo(() => {
  const isMobile = useMobile()
  return (
    <CenteredContainer margin maxWidth='md' sx={styles.root}>
      {!isMobile && (
        <Stack sx={styles.header}>
          <Text variant='headline' size='md'>
            Settings
          </Text>
        </Stack>
      )}
      <PaperContainer>
        <SettingsTabs />
        <Divider />
        <Stack>
          <Outlet />
        </Stack>
      </PaperContainer>
    </CenteredContainer>
  )
})

const styles = css.create({
  root: {},
  header: {
    padding: spacing.padding2,
  },
})
