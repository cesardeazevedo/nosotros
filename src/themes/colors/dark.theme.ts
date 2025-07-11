import { palette } from '@/themes/palette.stylex'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { css } from 'react-strict-dom'
import type { Theme } from '../types'

const darkTheme = css.createTheme(palette, {
  primary: colors.gray0,
  onPrimary: colors.gray12,
  primaryContainer: colors.gray0,
  onPrimaryContainer: colors.gray10,

  secondary: colors.stone4,
  onSecondary: colors.gray0,
  secondaryContainer: colors.gray7,
  onSecondaryContainer: colors.gray0,

  tertiary: '#0066e2',
  onTertiary: colors.gray0,
  tertiaryContainer: colors.indigo5,
  onTertiaryContainer: colors.indigo12,

  error: colors.red8,
  onError: colors.red12,
  errorContainer: colors.red7,
  onErrorContainer: colors.red0,

  surface: '#000000',
  onSurface: '#fff',
  onSurfaceVariant: colors.gray6,

  surfaceContainerLowest: '#000',
  surfaceContainerLow: colors.gray11,
  surfaceContainer: colors.gray10,
  surfaceContainerHigh: colors.gray8,
  surfaceContainerHighest: colors.gray7,

  inverseSurface: colors.gray0,
  inverseOnSurface: colors.gray10,
  inversePrimary: colors.gray0,

  outline: colors.gray8,
  outlineVariant: colors.gray9,

  primaryFixed: colors.gray12,
  onPrimaryFixed: colors.gray0,
  primaryFixedDim: colors.gray10,

  secondaryFixed: colors.gray0,
  onSecondaryFixed: colors.gray12,
  secondaryFixedDim: colors.gray2,

  tertiaryFixed: colors.indigo5,
  onTertiaryFixed: colors.indigo8,
  tertiaryFixedDim: colors.indigo7,

  shadow: colors.gray12,
})

export const theme: Partial<Theme> = {
  palette: darkTheme,
}
