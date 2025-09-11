import { CenteredContainer } from '@/components/elements/Layouts/CenteredContainer'
import { PaperContainer } from '@/components/elements/Layouts/PaperContainer'
import { SettingsTabs } from '@/components/modules/Settings/SettingsTabs'
import { Divider } from '@/components/ui/Divider/Divider'
import { Stack } from '@/components/ui/Stack/Stack'
import { useResetScroll } from '@/hooks/useResetScroll'
import { spacing } from '@/themes/spacing.stylex'
import { Outlet } from '@tanstack/react-router'
import { memo } from 'react'
import { css } from 'react-strict-dom'

export const SettingsRoute = memo(() => {
  useResetScroll()
  return (
    <CenteredContainer margin maxWidth='lg'>
      <PaperContainer sx={styles.root}>
        <Stack sx={styles.root} align='flex-start'>
          <SettingsTabs />
          <Divider orientation='vertical' />
          <Stack grow sx={styles.main}>
            <Outlet />
          </Stack>
        </Stack>
      </PaperContainer>
    </CenteredContainer>
  )
})

const styles = css.create({
  root: {
    height: 'calc(100vh - 180px)',
  },
  header: {
    padding: spacing.padding2,
  },
  main: {
    width: '100%',
    // padding: spacing.padding2,
  },
})
