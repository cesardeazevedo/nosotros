import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { state } from '@/themes/state.stylex'
import { css } from 'react-strict-dom'

const vars = {
  containerMinHeight: 'unset',
  containerColor: 'unset',
  nonTextOpacity: 'unset',

  // selectedContainer
  selectedContainerColor: 'unset',
  selectedContainerOpacity: 'unset',

  containerOpacity: '1',
  containerShape: shape.xl,
  containerMinHeight$sm: '38px',
  containerMinHeight$md: '48px',

  containerColor$disabled: 'transparent',
  containerOpacity$disabled: state.containerOpacity$disabled,

  containerColor$selected: palette.primaryContainer,
  containerOpacity$selected: '1',

  leadingSpace: spacing.padding2,
  trailingSpace: spacing.padding2,

  leadingSpace$sm: spacing.padding1,
  trailingSpace$sm: spacing.padding1,

  topSpace$sm: '0',
  bottomSpace$sm: '0',
  topSpace$md: '0',
  bottomSpace$md: '0',

  textColor: 'inherit',
  textOpacity: '1',
  textColor$disabled: palette.onSurface,
  textOpacity$disabled: state.opacity$disabled,
}

export const listItemTokens = css.defineVars(vars)
