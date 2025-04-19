import { elevation } from '@/themes/elevation.stylex'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { state } from '@/themes/state.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import { css } from 'react-strict-dom'

export const tabStateTokens = css.defineVars({
  elevation: 'unset',
  // stateLayer
  // &:disabled
  stateLayerColor$disabled: 'unset',
  // &:hover
  stateLayerColor$hover: 'unset',
  stateLayerOpacity$hover: 'unset',
  // &:pressed
  stateLayerColor$pressed: 'unset',
  stateLayerOpacity$pressed: 'unset',
})

const vars = {
  // activeIndicator
  activeIndicatorShape: 'unset',
  activeIndicatorHeight: 'unset',
  activeIndicatorColor: palette.primary,

  // container
  containerColor: palette.surface,
  containerElevation: elevation.shadows0,
  containerHeight: '64px',
  containerHeight$withIconAndLabelText: 'unset',
  containerShape: shape.full,
  // &:disabled
  containerElevation$disabled: elevation.shadows0,
  containerColor$disabled: palette.surface,
  containerOpacity$disabled: state.opacity$disabled,

  // stateLayer
  // &:hover
  stateLayerColor$hover: palette.onSurface,
  stateLayerOpacity$hover: state.opacity$hover,
  // &:pressed
  stateLayerColor$pressed: palette.primary,
  stateLayerOpacity$pressed: state.opacity$pressed,

  // activeStateLayer
  // &:hover
  activeStateLayerColor$hover: 'unset',
  activeStateLayerOpacity$hover: state.opacity$hover,
  // &:pressed
  activeStateLayerColor$pressed: 'unset',
  activeStateLayerOpacity$pressed: state.opacity$pressed,

  // icon
  iconColor: palette.onSurfaceVariant,
  // &:disabled
  iconColor$disabled: palette.onSurface,
  iconOpacity$disabled: state.opacity$disabled,
  // &:focus
  iconColor$focus: palette.onSurface,
  // &:hover
  iconColor$hover: palette.onSurface,
  // &:pressed
  iconColor$pressed: palette.onSurface,

  // actionIcon
  activeIconColor: 'inherit',
  // &:focus
  activeIconColor$focus: 'inherit',
  // &:hover
  activeIconColor$hover: 'inherit',
  // &:pressed
  activeIconColor$pressed: 'inherit',

  // labelText
  labelTextColor: palette.onSurfaceVariant,
  labelTextFont: typeScale.titleFont$sm,
  labelTextLineHeight: typeScale.titleLineHeight$sm,
  labelTextSize: typeScale.titleSize$sm,
  labelTextLetterSpacing: typeScale.titleLetterSpacing$sm,
  labelTextWeight: typeScale.titleWeight$sm,
  // &:disabled
  labelTextColor$disabled: palette.onSurface,
  labelTextOpacity$disabled: state.opacity$disabled,
  // &:focus
  labelTextColor$focus: palette.onSurface,
  // &:hover
  labelTextColor$hover: palette.onSurface,
  // &:pressed
  labelTextColor$pressed: palette.onSurface,

  // activeLabelText
  activeLabelTextColor: 'inherit',
  // &:focus
  activeLabelTextColor$focus: 'inherit',
  // &:hover
  activeLabelTextColor$hover: 'inherit',
  // &:pressed
  activeLabelTextColor$pressed: 'inherit',

  // icon
  iconSize: '24px',
}

export const tabTokens = css.defineVars(vars)
