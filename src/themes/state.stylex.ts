import { css } from 'react-strict-dom'

const vars = {
  opacity$hover: '0.08',
  opacity$pressed: '0.12',
  opacity$dragged: '0.16',

  opacity$disabled: '0.38',
  containerOpacity$disabled: '0.12',

  outlineOpacity$disabled: '0.12',
}

export const state = css.defineVars(vars)

export const stateTheme = css.createTheme(state, vars)
