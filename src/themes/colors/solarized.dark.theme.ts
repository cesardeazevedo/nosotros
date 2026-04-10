import { css } from 'react-strict-dom'

const SOL = {
  base04: '#00222b',
  base03: '#002b36',
  base02: '#073642',
  base01: '#586e75',
  base00: '#657b83',
  base0: '#839496',
  base1: '#93a1a1',
  base2: '#eee8d5',
  base3: '#fdf6e3',
  baseDark1: '#001e26',
  baseDark2: '#00151c',
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
  primary: SOL.base1,
  onPrimary: SOL.base03,
  primaryContainer: SOL.base1,
  onPrimaryContainer: SOL.base03,

  secondary: SOL.base0,
  onSecondary: SOL.base03,
  secondaryContainer: SOL.base02,
  onSecondaryContainer: SOL.base1,

  tertiary: SOL.magenta,
  onTertiary: SOL.base3,
  tertiaryContainer: '#3d1f2e',
  onTertiaryContainer: SOL.base2,

  error: SOL.red,
  onError: SOL.base03,
  errorContainer: '#4a1917',
  onErrorContainer: SOL.base2,

  surface: SOL.base04,
  onSurface: SOL.base2,
  onSurfaceVariant: SOL.base0,

  surfaceContainerLowest: SOL.baseDark2,
  surfaceContainerLow: SOL.baseDark1,
  surfaceContainer: SOL.base03,
  surfaceContainerHigh: SOL.base02,
  surfaceContainerHighest: SOL.base01,

  inverseSurface: SOL.base2,
  inverseOnSurface: SOL.base02,
  inversePrimary: SOL.base02,

  outline: SOL.base01,
  outlineVariant: SOL.base02,

  primaryFixed: SOL.base1,
  onPrimaryFixed: SOL.base03,
  primaryFixedDim: SOL.base0,

  secondaryFixed: SOL.base0,
  onSecondaryFixed: SOL.base03,
  secondaryFixedDim: SOL.base00,

  tertiaryFixed: SOL.cyan,
  onTertiaryFixed: SOL.base3,
  tertiaryFixedDim: '#1a736a',

  shadow: SOL.baseDark2,
}

export type ColorPalette = typeof vars
export type ColorKey = keyof ColorPalette
export const palette = css.defineVars(vars)
export const paletteTheme = css.createTheme(palette, vars)
