import { css } from 'react-strict-dom'

const font = [
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Roboto',
  'Helvetica',
  'Arial',
  'sans-serif',
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"',
].join(',')

const vars = {
  brand: font,
  plain: font,
  regular: '400',
  medium: '500',
  bold: '600',
}

export const typeFace = css.defineVars(vars)

export const typeFaceTheme = css.createTheme(typeFace, vars)
