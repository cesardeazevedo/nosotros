import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { state } from '@/themes/state.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import { css } from 'react-strict-dom'

export const buttonTokens = css.defineVars({
  containerColor: 'unset',
  containerColor$disabled: 'unset',
  containerOpacity$disabled: 'unset',
  containerElevation: 'unset',
  containerShape: shape.xl,
  containerHeight: '40px',
  containerMinWidth: '64px',
  labelTextColor: 'inherit',
  labelTextFont: typeScale.labelFont$lg,
  labelTextLineHeight: typeScale.labelLineHeight$lg,
  labelTextSize: typeScale.labelSize$lg,
  labelTextLetterSpacing: typeScale.labelLetterSpacing$lg,
  labelTextWeight: typeScale.labelWeight$lg,
  labelTextColor$focus: 'inherit',
  labelTextColor$hover: 'inherit',
  labelTextColor$pressed: 'inherit',
  labelTextColor$disabled: palette.onSurface,
  labelTextOpacity$disabled: state.opacity$disabled,

  // spacings
  leadingSpace: spacing.padding2,
  trailingSpace: spacing.padding2,

  // outline
  outlineColor: palette.outline,
  outlineColor$disabled: palette.onSurface,
  outlineOpacity$disabled: state.outlineOpacity$disabled,
})
