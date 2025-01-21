import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import { css } from 'react-strict-dom'

const vars = {
  topSpace: spacing.padding1,
  bottomSpace: spacing.padding1,
  leadingSpace: spacing.padding1,
  trailingSpace: spacing.padding1,

  // container
  containerColor: palette.inverseSurface,
  containerShape: shape.md,
  containerMaxWidth: '215px',
  containerMinHeight: '24px',

  // supportingText
  supportingTextColor: palette.inverseOnSurface,
  supportingTextFont: typeScale.labelFont$md,
  supportingTextSize: typeScale.labelSize$md,
  supportingTextWeight: typeScale.labelWeight$md,
  supportingTextLineHeight: typeScale.labelLineHeight$md,
  supportingTextLetterSpacing: typeScale.labelLetterSpacing$md,
}

export const tooltipTokens = css.defineVars(vars)
