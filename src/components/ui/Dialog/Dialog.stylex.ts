import { elevation } from '@/themes/elevation.stylex'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { css } from 'react-strict-dom'

const vars = {
  fullScreenBreakpoint: '900px',

  containerMinWidth: '280px',
  containerMaxWidth: `min(560px, calc(100% - 48px))`,
  containerMaxHeight: `min(460px, calc(100% - 48px))`,
  // container
  containerColor: palette.surfaceContainerHigh,
  containerElevation: elevation.shadows3,
  containerShape: shape.xl,
}

export const dialogTokens = css.defineVars(vars)
