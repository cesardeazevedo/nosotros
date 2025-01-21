import { palette } from '@/themes/palette.stylex'
import { css } from 'react-strict-dom'

const vars = {
  containerShape: 'unset',
  containerSize: 'unset',
  containerColor: palette.primaryContainer,
  labelTextColor: palette.onPrimaryContainer,
  labelTextSize: 'unset',
}

export const avatarTokens = css.defineVars(vars)
