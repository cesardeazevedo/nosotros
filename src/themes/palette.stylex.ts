import { css } from 'react-strict-dom'
import { colors } from '@stylexjs/open-props/lib/colors.stylex'

export const vars = {
  primary: colors.gray12,
  onPrimary: colors.gray0,
  primaryContainer: colors.gray12,
  onPrimaryContainer: colors.gray0,

  secondary: colors.gray0,
  onSecondary: colors.gray12,
  secondaryContainer: colors.gray3,
  onSecondaryContainer: colors.gray12,

  tertiary: colors.indigo7,
  onTertiary: colors.gray0,
  tertiaryContainer: colors.indigo5,
  onTertiaryContainer: colors.indigo12,

  error: colors.red8,
  onError: colors.gray0,
  errorContainer: colors.red1,
  onErrorContainer: colors.red12,

  surface: colors.gray0,
  onSurface: colors.stone11,
  onSurfaceVariant: colors.stone8,

  surfaceContainerLowest: '#fff',
  surfaceContainerLow: colors.stone0,
  surfaceContainer: colors.stone1,
  surfaceContainerHigh: colors.stone2,
  surfaceContainerHighest: colors.stone3,

  inverseSurface: colors.gray8,
  inverseOnSurface: colors.gray0,
  inversePrimary: colors.gray12,

  outline: colors.gray6,
  outlineVariant: colors.gray4,

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
}

export type ColorPalette = typeof vars

export type ColorKey = keyof ColorPalette

export const palette = css.defineVars(vars)

export const paletteTheme = css.createTheme(palette, vars)
