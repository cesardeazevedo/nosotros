import { duration } from '@/themes/duration.stylex'
import { easing } from '@/themes/easing.stylex'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { css } from 'react-strict-dom'

const vars = {
  color: palette.primary,
  width: '2px',
  offset: '3px',
  shape: shape.none,
  animationDuration: duration.medium2,
}

export const focusRingTokens = css.defineVars(vars)

const ringBounce = css.keyframes({
  '0%': { outlineWidth: '0px', outlineOffset: '0px' },
  '60%': {
    outlineWidth: `calc(${focusRingTokens.width} + 2px)`,
    outlineOffset: `calc(${focusRingTokens.offset} + 2px)`,
  },
  '100%': { outlineWidth: focusRingTokens.width, outlineOffset: focusRingTokens.offset },
})

export const focusRing = css.create({
  focusable: {
    outlineStyle: 'solid',
    outlineWidth: '0px',
    outlineColor: 'transparent',
    outlineOffset: '0px',
    transitionProperty: 'outline-color, outline-offset, outline-width',
    transitionDuration: duration.short3,
    transitionTimingFunction: easing.emphasized,
    ':focus-visible': {
      outlineColor: focusRingTokens.color,
      outlineWidth: focusRingTokens.width,
      outlineOffset: focusRingTokens.offset,
      animationName: ringBounce,
      animationDuration: focusRingTokens.animationDuration,
      animationTimingFunction: easing.emphasized,
      animationFillMode: 'forwards',
    },
  },
})
