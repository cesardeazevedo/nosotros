import themes from '@/themes/colors'
import type { ThemeKeys } from '@/themes/types'
import { useMediaQuery } from './useMediaQuery'

export function useTheme(defaultTheme: ThemeKeys) {
  const isSystemDark = useMediaQuery('(prefers-color-scheme: dark)')
  const theme = defaultTheme === 'auto' ? (isSystemDark ? 'dark' : 'light') : defaultTheme
  return themes[theme] || themes.light
}
