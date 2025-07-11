import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { css } from 'react-strict-dom'

const vars = {
  zIndex: 40,

  // container
  containerShape: shape.xl,
  containerColor: palette.surfaceContainerLow,
  // &:error
  containerColor$error: palette.errorContainer,

  // animation
  animationTargetColor: palette.inverseSurface,
  // &:pulse
  animationMaxOpacity$pulse: '0.12',
  animationDuration$pulse: '2s',
  animationDelay$pulse: '0.5s',
  // &:wave
  animationMaxOpacity$wave: '0.08',
  animationDuration$wave: '2s',
  animationDelay$wave: '0.5s',
}

export const skeletonTokens = css.defineVars(vars)
