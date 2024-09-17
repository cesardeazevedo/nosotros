import { css } from 'react-strict-dom'

export const vars = {
  emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
  emphasizedAccelerate: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
  emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
  legacy: 'cubic-bezier(0.4, 0, 0.2, 1)',
  legacyAccelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  legacyDecelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  linear: 'cubic-bezier(0, 0, 1, 1)',
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  standardAccelerate: 'cubic-bezier(0.3, 0, 1, 1)',
  standardDecelerate: 'cubic-bezier(0, 0, 0, 1)',
}

export const easing = css.defineVars(vars)

export const easingTheme = css.createTheme(easing, vars)
