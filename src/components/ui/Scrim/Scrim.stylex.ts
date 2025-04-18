import { css } from 'react-strict-dom'

const vars = {
  containerColor$darken: `color-mix(in srgb, #000 70%, transparent)`,
  containerColor$lighten: `rgba(255, 255, 255, 0.5)`,
}

export const scrimTokens = css.defineVars(vars)

export const scrimTheme = css.createTheme(scrimTokens, vars)
