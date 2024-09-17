import { elevation } from '@/themes/elevation.stylex'
import { palette } from '@/themes/palette.stylex'
import { css } from 'react-strict-dom'
import { buttonTokens } from '../Button/Button.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import { state } from '@/themes/state.stylex'
import { spacing } from '@/themes/spacing.stylex'

const vars = {
  containerShape: buttonTokens.containerShape,
  containerHeight: '32px',

  elevation: 'unset',

  flatContainerColor: palette.surfaceContainerLow,

  leadingSpace: spacing.padding2,
  trailingSpace: spacing.padding2,
  iconLeadingSpace: spacing.padding1,

  elevatedContainerColor: palette.surfaceContainerLow,
  elevatedContainerElevation: elevation.shadows1,
  elevatedContainerElevation$focus: elevation.shadows1,
  elevatedContainerElevation$hover: elevation.shadows2,
  elevatedContainerElevation$pressed: elevation.shadows1,

  selectedElevatedContainerElevation: elevation.shadows1,

  leadIconColor: palette.primary,

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
