import { outline } from '@/themes/outline.stylex'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { state } from '@/themes/state.stylex'
import { css } from 'react-strict-dom'

const vars = {
  size: '20px',
  iconSize: '16px',
  shape: shape.xs,
  borderWidth: outline.sm,
  borderColor: palette.outline,
  borderColor$hover: palette.onSurface,
  borderColor$focus: palette.primary,
  borderColor$disabled: palette.onSurfaceVariant,
  backgroundColor: 'transparent',
  backgroundColor$hover: 'transparent',
  backgroundColor$focus: 'transparent',
  backgroundColor$disabled: palette.surfaceContainerHighest,
  selectedColor: palette.primary,
  selectedColor$hover: palette.primary,
  selectedColor$focus: palette.primary,
  selectedColor$disabled: palette.onSurfaceVariant,
  selectedIconColor: palette.onPrimary,
  disabledOpacity: state.opacity$disabled,
  stateLayerSize: '40px',
}

export const checkboxTokens = css.defineVars(vars)
