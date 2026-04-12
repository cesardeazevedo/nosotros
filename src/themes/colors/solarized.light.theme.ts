import { css } from 'react-strict-dom'

const SOL = {
  base03: '#002b36',
  base02: '#073642',
  base01: '#586e75',
  base00: '#657b83',
  base0: '#e1d7b6',
  base1: '#e7dfc5',
  base2: '#eee8d5',
  base3: '#fdf6e3',
  base4: '#fdf7e7',
  base5: '#fdf9ec',
  yellow: '#b58900',
  orange: '#cb4b16',
  red: '#dc322f',
  magenta: '#d33682',
  violet: '#6c71c4',
  blue: '#268bd2',
  cyan: '#2aa198',
  green: '#859900',
}

export const vars = {
  primary: SOL.base03,
  onPrimary: SOL.base3,
  primaryContainer: SOL.base03,
  onPrimaryContainer: SOL.base3,

  secondary: SOL.base01,
  onSecondary: SOL.base3,
  secondaryContainer: SOL.base2,
  onSecondaryContainer: SOL.base03,

  tertiary: SOL.magenta,
  onTertiary: SOL.base03,
  tertiaryContainer: '#d7efe9',
  onTertiaryContainer: SOL.base03,

  error: SOL.red,
  onError: SOL.base3,
  errorContainer: '#f6d2cf',
  onErrorContainer: SOL.base03,

  surface: SOL.base4,
  onSurface: SOL.base02,
  onSurfaceVariant: SOL.base00,

  surfaceContainerLowest: SOL.base4,
  surfaceContainerLow: SOL.base3,
  surfaceContainer: SOL.base2,
  surfaceContainerHigh: SOL.base1,
  surfaceContainerHighest: SOL.base0,

  inverseSurface: SOL.base02,
  inverseOnSurface: SOL.base2,
  inversePrimary: SOL.base2,

  outline: SOL.base1,
  outlineVariant: SOL.base2,

  primaryFixed: SOL.base03,
  onPrimaryFixed: SOL.base3,
  primaryFixedDim: SOL.base02,

  secondaryFixed: SOL.base01,
  onSecondaryFixed: SOL.base3,
  secondaryFixedDim: SOL.base00,

  tertiaryFixed: SOL.cyan,
  onTertiaryFixed: SOL.base03,
  tertiaryFixedDim: '#22907f',

  shadow: SOL.base03,
}

export type ColorPalette = typeof vars
export type ColorKey = keyof ColorPalette

export const palette = css.defineVars(vars)
export const paletteTheme = css.createTheme(palette, vars)
