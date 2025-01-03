import { palette } from '@/themes/palette.stylex'
import { css } from 'react-strict-dom'

const vars = {
  color: 'inherit',
  color$disabled: palette.onSurface,
}

export const circularProgressTokens = css.defineVars(vars)
