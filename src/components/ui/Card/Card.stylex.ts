import { shape } from '@/themes/shape.stylex'
import { css } from 'react-strict-dom'

const tokens = {
  containerShape: shape.xl,
  containerElevation: 'unset',
}

export const cardTokens = css.defineVars(tokens)
