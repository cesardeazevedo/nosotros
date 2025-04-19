import { outline } from '@/themes/outline.stylex'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import { css } from 'react-strict-dom'

const vars = {
  thickness: outline.xs,
  shape: shape.none,
  color: palette.outlineVariant,

  // inset
  insetLeadingSpace: spacing.padding8,
  insetTrailingSpace: spacing.padding8,

  // text
  textLeadingSpace: spacing.padding3,
  textTrailingSpace: spacing.padding3,
  textColor: palette.outline,
  textFont: typeScale.bodyFont$sm,
  textSize: typeScale.bodySize$sm,
  textWeight: typeScale.bodyWeight$sm,
  textLineHeight: typeScale.bodyLineHeight$sm,
  textLetterSpacing: typeScale.bodyLetterSpacing$sm,
}

export const dividerTokens = css.defineVars(vars)
