import { css } from 'react-strict-dom'

const vars = {
  shadows0: 'none',
  shadows1: '0px 2px 6px 0px rgba(0, 0, 0, 0.14)',
  shadows2: '0px 2px 10px 0px rgba(0, 0, 0, 0.14)',
  shadows3: '0px 2px 14px 0px rgba(0, 0, 0, 0.14)',
  shadows4: '0px 2px 18px 0px rgba(0, 0, 0, 0.14)',
}

export const elevation = css.defineVars(vars)

export const elevationTheme = css.createTheme(elevation, vars)
