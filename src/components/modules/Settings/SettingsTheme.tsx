import { ButtonBase } from '@/components/ui/ButtonBase/ButtonBase'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useSetSettings, useSettings } from '@/hooks/useSettings'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconCheck, IconMoon, IconSun } from '@tabler/icons-react'
import { memo } from 'react'
import { css } from 'react-strict-dom'

export const SettingsTheme = memo(function SettingsTheme() {
  const settings = useSettings()
  const setSettings = useSetSettings()
  const isLight = settings.theme === 'light'
  const isDark = settings.theme === 'dark'
  const isAuto = settings.theme === 'auto'
  return (
    <>
      <Paper outlined shape='full' sx={styles.root}>
        <Stack sx={styles.wrapper} gap={0.5}>
          <ButtonBase
            sx={[styles.button, isLight && styles.button$selected]}
            onClick={() => setSettings({ theme: 'light' })}>
            <Stack gap={1}>
              {isLight ? <IconCheck size={20} /> : <IconSun size={22} strokeWidth='1.8' />}
              <Text size='md'>Light</Text>
            </Stack>
          </ButtonBase>
          <ButtonBase
            sx={[styles.button, isDark && styles.button$selected]}
            onClick={() => setSettings({ theme: 'dark' })}>
            <Stack gap={1}>
              {isDark ? <IconCheck size={20} /> : <IconMoon size={20} strokeWidth='1.8' />}
              <Text size='md'>Dark</Text>
            </Stack>
          </ButtonBase>
          <ButtonBase
            sx={[styles.button, isAuto && styles.button$selected]}
            onClick={() => setSettings({ theme: 'auto' })}>
            <Stack gap={1}>
              {isAuto && <IconCheck size={20} />}
              <Text size='md'>System</Text>
            </Stack>
          </ButtonBase>
        </Stack>
      </Paper>
    </>
  )
})

const styles = css.create({
  root: {
    overflow: 'hidden',
  },
  wrapper: {
    overflow: 'hidden',
  },
  button: {
    maxWidth: 100,
    borderRadius: shape.full,
    padding: spacing.padding2,
  },
  button$selected: {
    backgroundColor: palette.secondaryContainer,
  },
})
