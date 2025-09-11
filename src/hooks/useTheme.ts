import themes from '@/themes/colors'
import { type ThemeKeys } from '@/themes/types'
import { useMediaQuery } from './useMediaQuery'
import { useSettings } from './useSettings'

export function useThemePalette() {
  const theme = useCurrentTheme()
  return themes[theme] || themes.light
}

export function useCurrentTheme(): ThemeKeys {
  const isSystemDark = useMediaQuery('(prefers-color-scheme: dark)')
  const settingsTheme = useSettings().theme || 'auto'
  return settingsTheme === 'auto' ? (isSystemDark ? 'dark' : 'light') : settingsTheme
}

export function useIsDarkTheme() {
  return useCurrentTheme() === 'dark'
}
