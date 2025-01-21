import { palette } from '@/themes/palette.stylex'
import { state } from '@/themes/state.stylex'
import { css } from 'react-strict-dom'

export const rippleTokens = css.defineVars({
  color$hover: palette.onSurface,
  color$pressed: palette.onSurface,
  color$dragged: palette.onSurface,
  opacity$hover: state.opacity$hover,
  opacity$pressed: state.opacity$pressed,
  opacity$dragged: state.opacity$dragged,
  width: 'auto',
  height: 'auto',
})
