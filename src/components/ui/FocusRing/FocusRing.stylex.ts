import { css } from 'react-strict-dom'
import { outline } from '@/themes/outline.stylex'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'

const vars = {
  color: palette.secondary,
  shape: shape.none,
  width: outline.md,
  widthActive: outline.xl,
}

export const focusRingTokens = css.defineVars(vars)

export const focusRingTheme = css.createTheme(focusRingTokens, vars)
