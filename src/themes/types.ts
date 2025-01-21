import type { durationTheme } from './duration.stylex'
import type { easingTheme } from './easing.stylex'
import type { elevationTheme } from './elevation.stylex'
import type { paletteTheme } from './palette.stylex'
import type { shapeTheme } from './shape.stylex'
import type { spacingTheme } from './spacing.stylex'
import type { stateTheme } from './state.stylex'
import type { typeFaceTheme } from './typeFace.stylex'
import type { typeScaleTheme } from './typeScale.stylex'

export type ThemeKeys = 'auto' | 'light' | 'dark' | 'black' | 'solarized'

export type Theme = {
  key: ThemeKeys
  easing: typeof easingTheme
  palette: typeof paletteTheme
  duration: typeof durationTheme
  state: typeof stateTheme
  shape: typeof shapeTheme
  spacing: typeof spacingTheme
  typeFace: typeof typeFaceTheme
  typeScale: typeof typeScaleTheme
  elevation: typeof elevationTheme
}
