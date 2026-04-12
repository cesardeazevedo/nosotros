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
  warning: colors.yellow8,

  surface: colors.stone0,
  surfaceBright: '#fff',
  onSurface: colors.gray11,
  onSurfaceVariant: colors.gray8,

  surfaceContainerLowest: '#fdfdfd',
  surfaceContainerLow: '#fcfcfd',
  surfaceContainer: colors.gray1,
  surfaceContainerHigh: colors.gray2,
  surfaceContainerHighest: colors.gray3,

  inverseSurface: colors.gray8,
  inverseOnSurface: colors.gray0,
  inversePrimary: colors.gray12,

  outline: colors.gray3,
  outlineVariant: colors.gray2,

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
