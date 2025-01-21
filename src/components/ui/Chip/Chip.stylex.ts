import { elevation } from '@/themes/elevation.stylex'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { state } from '@/themes/state.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import { css } from 'react-strict-dom'
import { buttonTokens } from '../Button/Button.stylex'

const vars = {
  containerShape: buttonTokens.containerShape,
  containerHeight: '32px',

  elevation: 'unset',

  flatContainerColor: 'inherit',

  leadingSpace: spacing.padding1,
  trailingSpace: spacing.padding1,
  iconLeadingSpace: spacing['padding0.5'],

  elevatedContainerColor: palette.surfaceContainerLow,
  elevatedContainerElevation: elevation.shadows1,
  elevatedContainerElevation$focus: elevation.shadows1,
  elevatedContainerElevation$hover: elevation.shadows2,
  elevatedContainerElevation$pressed: elevation.shadows1,

  selectedFlatContainerColor: 'inherit',
  selectedElevatedContainerElevation: elevation.shadows1,

  iconColor: palette.primary,

  // labelText
  labelTextColor: palette.onSurface,
  labelTextFont: typeScale.labelFont$lg,
  labelTextLineHeight: typeScale.labelLineHeight$lg,
  labelTextSize: typeScale.labelSize$lg,
  labelTextLetterSpacing: typeScale.labelLetterSpacing$lg,
  labelTextWeight: typeScale.labelWeight$lg,
  // &:disabled
  labelTextColor$disabled: palette.onSurface,
  labelTextOpacity$disabled: state.opacity$disabled,
  // &:focus
  labelTextColor$focus: palette.onSurface,
  // &:hover
  labelTextColor$hover: palette.onSurface,
  // &:pressed
  labelTextColor$pressed: palette.onSurface,
}

export const chipTokens = css.defineVars(vars)

export const chipTheme = css.createTheme(chipTokens, vars)
