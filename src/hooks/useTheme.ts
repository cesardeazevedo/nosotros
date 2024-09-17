import themes from '@/themes/colors'
import { useMediaQuery } from './useMediaQuery'
import type { ThemeKeys } from '@/themes/types'

export function useTheme(defaultTheme: ThemeKeys) {
  const isSystemDark = useMediaQuery('(prefers-color-scheme: dark)')
  const theme = defaultTheme === 'auto' ? (isSystemDark ? 'black' : 'light') : defaultTheme
  return themes[theme] || themes.light
}
