import { css } from 'react-strict-dom'

const vars = {
  shadows0: 'none',
  shadows1:
    '0 1px 4px 0 rgba(0, 0, 0, 0.06)',
  shadows2: '0 4px 8px 0 rgba(0, 0, 0, 0.06)',
  shadows3: '0 8px 16px 0 rgba(0, 0, 0, 0.06)',
  shadows4: '0 12px 24px 0 rgba(0, 0, 0, 0.06)',
}

export const elevation = css.defineVars(vars)

export const elevationTheme = css.createTheme(elevation, vars)
