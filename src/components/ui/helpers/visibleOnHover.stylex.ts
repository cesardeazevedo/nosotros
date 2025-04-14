import { duration } from '@/themes/duration.stylex'
import { css } from 'react-strict-dom'

export const visibleOnHoverTokens = css.defineVars({
  visibleOnHover: 'hidden',
})

export const visibleOnHoverStyle = css.create({
  root: {
    [visibleOnHoverTokens.visibleOnHover]: {
      default: 0,
      ':hover': 1,
    },
  },
  item: {
    transition: 'opacity',
    transitionDuration: duration.short2,
    opacity: visibleOnHoverTokens.visibleOnHover,
  },
})
