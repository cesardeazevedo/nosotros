import { css } from 'react-strict-dom'

const vars = {
  none: '0px',
  xs: '6px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '16px',
  full: '999px',
}

export type Shapes = typeof vars
export type ShapeKey = keyof Shapes

export const shape = css.defineVars(vars)

export const shapeTheme = css.createTheme(shape, vars)
