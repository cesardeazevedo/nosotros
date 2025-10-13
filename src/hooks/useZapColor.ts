import { colors } from '@stylexjs/open-props/lib/colors.stylex'
import { css } from 'react-strict-dom'

export const zapThemes = {
  light: [colors.violet12, colors.violet10, colors.violet9, colors.violet8, colors.violet7, colors.violet6],
  dark: [colors.violet1, colors.violet2, colors.violet3, colors.violet4, colors.violet5, colors.violet6],
} as const

// ranges that makes sense for individual zaps
export function getZapColorByAmount(zapAmount: number, palette: typeof zapThemes.light | typeof zapThemes.dark) {
  if (zapAmount < 100) {
    return palette[0]
  } else if (zapAmount >= 100 && zapAmount < 500) {
    return palette[1]
  } else if (zapAmount >= 500 && zapAmount < 1000) {
    return palette[2]
  } else if (zapAmount >= 1000 && zapAmount < 5000) {
    return palette[3]
  } else if (zapAmount >= 5000 && zapAmount < 10000) {
    return palette[4]
  } else {
    return palette[5]
  }
}

function getZapTotalColor(zapAmount: number, palette: typeof zapThemes.light | typeof zapThemes.dark) {
  if (zapAmount < 1000) {
    return palette[0]
  } else if (zapAmount >= 1000 && zapAmount < 5000) {
    return palette[1]
  } else if (zapAmount >= 5000 && zapAmount < 10000) {
    return palette[2]
  } else if (zapAmount >= 10000 && zapAmount < 50000) {
    return palette[3]
  } else if (zapAmount >= 50000 && zapAmount < 100000) {
    return palette[4]
  } else {
    return palette[5]
  }
}

export function getZapColor(zapAmount: number, theme: 'light' | 'dark' = 'light', total: boolean = true) {
  const palette = zapThemes[theme as 'light' | 'dark']
  return total ? getZapTotalColor(zapAmount, palette) : getZapColorByAmount(zapAmount, palette)
}

export const styles = css.create({
  color: (color: string) => ({ color }),
})
