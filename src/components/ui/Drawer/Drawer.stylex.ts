import { spacing } from '@/themes/spacing.stylex'
import { css } from 'react-strict-dom'

const vars = {
  detachedContainerInset: spacing.padding2,
}

export const drawerTokens = css.defineVars(vars)
