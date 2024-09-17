import { durationTheme } from '../duration.stylex'
import { easingTheme } from '../easing.stylex'
import { elevationTheme } from '../elevation.stylex'
import { paletteTheme } from '../palette.stylex'
import { shapeTheme } from '../shape.stylex'
import { spacingTheme } from '../spacing.stylex'
import { typeFaceTheme } from '../typeFace.stylex'
import { typeScaleTheme } from '../typeScale.stylex'
import type { Theme, ThemeKeys } from '../types'
import { theme as blackTheme } from './dark.theme'
import { theme as lightTheme } from './light.theme'

const baseThemes = {
  shape: shapeTheme,
  spacing: spacingTheme,
  duration: durationTheme,
  easing: easingTheme,
  palette: paletteTheme,
  typeFace: typeFaceTheme,
  typeScale: typeScaleTheme,
  elevation: elevationTheme,
}

export default {
  light: {
    key: 'light',
    ...baseThemes,
    ...lightTheme,
  },
  dark: {
    key: 'dark',
    ...baseThemes,
    ...blackTheme,
  },
} as Record<ThemeKeys, Theme>
