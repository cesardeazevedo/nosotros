import { outline } from '@/themes/outline.stylex'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { state } from '@/themes/state.stylex'
import { css } from 'react-strict-dom'

export const switchStateTokens = css.defineVars({
  stateLayerColor$hover: 'unset',
  stateLayerOpacity$hover: 'unset',
  stateLayerColor$pressed: 'unset',
  stateLayerOpacity$pressed: 'unset',
  selectedIconTransform$on: 'unset',
  iconColor: 'unset',
})

const vars = {
  trackShape: shape.full,
  trackWidth: '52px',
  trackHeight: '32px',
  trackColor: palette.surfaceContainerLowest,
  trackColor$disabled: palette.surfaceContainerHighest,
  trackOpacity$disabled: state.containerOpacity$disabled,
  // &:focus
  trackColor$focus: palette.surfaceContainerHighest,
  // &:hover
  trackColor$hover: palette.surfaceContainerHighest,
  // &:pressed
  trackColor$pressed: palette.surfaceContainerHighest,

  // selectedTrack
  selectedTrackColor: palette.primary,
  // &:disabled
  selectedTrackColor$disabled: palette.onSurface,
  // &:focus
  selectedTrackColor$focus: palette.primary,
  // &:hover
  selectedTrackColor$hover: palette.primary,
  // &:pressed
  selectedTrackColor$pressed: palette.primary,

  // stateLayer
  stateLayerShape: shape.full,
  // stateLayer
  stateLayerSize: '48px',

  // selectedStateLayer
  // &:hover
  selectedStateLayerColor$hover: palette.primary,
  selectedStateLayerOpacity$hover: state.opacity$hover,

  // trackOutline
  trackOutlineWidth: outline.sm,
  trackOutlineColor: palette.outline,
  // &:disabled
  trackOutlineColor$disabled: palette.onSurface,
  // &:focus
  trackOutlineColor$focus: palette.outline,
  // &:hover
  trackOutlineColor$hover: palette.outline,
  // &:pressed
  trackOutlineColor$pressed: palette.outline,

  // handle
  handleShape: shape.full,
  handleColor: palette.outline,
  handleWidth: '16px',
  handleHeight: '16px',
  handleWidth$withIcon: '24px',
  handleHeight$withIcon: '24px',
  // &:disabled
  handleColor$disabled: palette.onSurfaceVariant,
  handleOpacity$disabled: state.opacity$disabled,
  // &:hover
  handleColor$hover: palette.onSurfaceVariant,
  // &:focus
  handleColor$focus: palette.onSurfaceVariant,
  // &:pressed
  handleColor$pressed: palette.onSurfaceVariant,
  handleWidth$pressed: '28px',
  handleHeight$pressed: '28px',

  // selectedHandle
  selectedHandleColor: palette.onPrimary,
  selectedHandleWidth: '24px',
  selectedHandleHeight: '24px',
  // &:disabled
  selectedHandleColor$disabled: palette.surface,
  selectedHandleOpacity$disabled: '1',
  // &:focus
  selectedHandleColor$focus: palette.primaryContainer,
  // &:hover
  selectedHandleColor$hover: palette.onPrimaryContainer,
  // &:pressed
  selectedHandleColor$pressed: palette.primaryContainer,

  // icon
  iconColor: palette.surfaceContainerHighest,
  iconSize: '16px',
  // &:disabled
  iconColor$disabled: palette.surface,
  iconOpacity$disabled: '0.76',
  // &:focus
  iconColor$focus: palette.surfaceContainerHighest,
  // &:hover
  iconColor$hover: palette.surfaceContainerHighest,
  // &:pressed
  iconColor$pressed: palette.surfaceContainerHighest,

  // selectedIcon
  selectedIconColor: palette.onPrimaryContainer,
  selectedIconSize: '16px',
  // &:disabled
  selectedIconColor$disabled: palette.onSurface,
  selectedIconOpacity$disabled: state.opacity$disabled,
  // &:focus
  selectedIconColor$focus: palette.onPrimaryContainer,
  // &:hover
  selectedIconColor$hover: palette.onPrimaryContainer,
  // &:pressed
  selectedIconColor$pressed: palette.onPrimaryContainer,
}

export const switchTokens = css.defineVars(vars)
