import { ButtonBase } from '@/components/ui/ButtonBase/ButtonBase'
import { Paper } from '@/components/ui/Paper/Paper'
import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { useGlobalSettings } from '@/hooks/useRootStore'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { IconCheck, IconMoon, IconSun } from '@tabler/icons-react'
import { observer } from 'mobx-react-lite'
import { css } from 'react-strict-dom'

export const SettingsTheme = observer(function SettingsTheme() {
  const globalSettings = useGlobalSettings()
  const isLight = globalSettings.theme === 'light'
  const isDark = globalSettings.theme === 'dark'
  const isAuto = globalSettings.theme === 'auto'
  return (
    <>
      <Paper outlined shape='full' sx={styles.root}>
        <Stack sx={styles.wrapper} gap={0.5}>
          <ButtonBase
            sx={[styles.button, isLight && styles.button$selected]}
            onClick={() => globalSettings.set('theme', 'light')}>
            <Stack gap={1}>
              {isLight ? <IconCheck size={20} /> : <IconSun size={22} strokeWidth='1.8' />}
              <Text size='md'>Light</Text>
            </Stack>
          </ButtonBase>
          <ButtonBase
            sx={[styles.button, isDark && styles.button$selected]}
            onClick={() => globalSettings.set('theme', 'dark')}>
            <Stack gap={1}>
              {isDark ? <IconCheck size={20} /> : <IconMoon size={20} strokeWidth='1.8' />}
              <Text size='md'>Dark</Text>
            </Stack>
          </ButtonBase>
          <ButtonBase
            sx={[styles.button, isAuto && styles.button$selected]}
            onClick={() => globalSettings.set('theme', 'auto')}>
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
    //padding: 8,
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
