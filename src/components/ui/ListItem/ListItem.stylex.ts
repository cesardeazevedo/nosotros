import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { state } from '@/themes/state.stylex'
import { css } from 'react-strict-dom'

const vars = {
  containerMinHeight: 'unset',
  containerColor: 'unset',
  topSpace: 'unset',
  bottomSpace: 'unset',
  nonTextOpacity: 'unset',

  // selectedContainer
  selectedContainerColor: 'unset',
  selectedContainerOpacity: 'unset',

  containerOpacity: '1',
  containerShape: shape.none,
  containerMinHeight$sm: '36px',
  containerMinHeight$md: '48px',

  containerColor$disabled: 'transparent',
  containerOpacity$disabled: state.containerOpacity$disabled,

  containerColor$selected: palette.primaryContainer,
  containerOpacity$selected: '1',

  leadingSpace: spacing.padding2,
  trailingSpace: spacing.padding2,

  topSpace$sm: '0',
  bottomSpace$sm: '0',
  topSpace$md: '0',
  bottomSpace$md: '0',
  topSpace$lg: spacing.padding1,
  bottomSpace$lg: spacing.padding1,
  topSpace$xl: spacing.padding2,
  bottomSpace$xl: spacing.padding2,

  textColor: 'inherit',
  textOpacity: '1',
  textColor$disabled: palette.onSurface,
  textOpacity$disabled: state.opacity$disabled,
}

export const listItemTokens = css.defineVars(vars)
