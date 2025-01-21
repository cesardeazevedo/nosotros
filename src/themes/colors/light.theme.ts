import { css } from 'react-strict-dom'
import { palette, vars } from '@/themes/palette.stylex'
import type { Theme } from '../types'

const lightTheme = css.createTheme(palette, {
  ...vars,
})

export const theme: Partial<Theme> = { palette: lightTheme }
