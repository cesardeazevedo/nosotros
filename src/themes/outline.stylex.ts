import { css } from 'react-strict-dom'
import { scale } from './scale.stylex'

const vars = {
  none: '0px',
  xs: `max(1px, 1px * ${scale.scale})`,
  sm: `max(1px, 2px * ${scale.scale})`,
  md: `max(1px, 3px * ${scale.scale})`,
  lg: `max(1px, 5px * ${scale.scale})`,
  xl: `max(1px, 8px * ${scale.scale})`,
}

export const outline = css.defineVars(vars)

export const outlineTheme = css.createTheme(outline, vars)
