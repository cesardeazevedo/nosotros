import { forwardRef } from 'react'
import { css, html } from 'react-strict-dom'
import { mergeRefs } from '../helpers/mergeRefs'
import type { IVisualState } from '../hooks/useRipple'
import { useRipple } from '../hooks/useRipple'
import type { SxProps } from '../types'
import { rippleTokens } from './Ripple.stylex'

type Props = {
  sx?: SxProps
  visualState: IVisualState
  disabled?: boolean
  element?: React.RefObject<HTMLElement>
}

export const Ripple = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { sx, disabled, element, visualState } = props
  const { pressed, surfaceRef, setHostRef } = useRipple({
    visualState,
    for: element,
    disabled,
  })

  const refs = mergeRefs([ref, setHostRef])

  return (
    <html.div aria-hidden style={[styles.root, sx]} ref={refs}>
      <html.div
        ref={surfaceRef}
        style={[
          styles.rippleSurface,
          (visualState.hovered || pressed) && styles.rippleSurface$hover,
          pressed && styles.rippleSurface$pressed,
          !pressed && visualState.pressed && styles.rippleSurface$pressedStatic,
          visualState.dragged && styles.rippleSurface$dragged,
        ]}
      />
    </html.div>
  )
})

const styles = css.create({
  root: {
    display: 'flex',
    margin: 'auto',
    borderRadius: 'inherit',
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    width: rippleTokens.width,
    height: rippleTokens.height,
  },
  rippleSurface: {
    borderRadius: 'inherit',
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    '::before': {
      content: '',
      opacity: 0,
      position: 'absolute',
      inset: 0,
      backgroundColor: rippleTokens.color$hover,
    },
    '::after': {
      content: '',
      opacity: 0,
      position: 'absolute',
      // press ripple fade-out
      backgroundImage: `radial-gradient(closest-side, ${rippleTokens.color$hover} max(calc(100% - 70px), 65%), transparent 100%)`,
      transformOrigin: 'center center',
    },
  },
  rippleSurface$hover: {
    '::before': {
      opacity: '0.10',
    },
  },
  rippleSurface$pressed: {
    '::after': {
      opacity: '0.12',
    },
  },
  rippleSurface$pressedStatic: {
    '::before': {
      backgroundColor: rippleTokens.color$hover,
      opacity: '0.08',
    },
    '::after': {
      inset: 0,
      backgroundColor: rippleTokens.color$hover,
      opacity: '0.12',
    },
  },
  rippleSurface$dragged: {
    '::before': {
      backgroundColor: rippleTokens.color$hover,
      opacity: '0.16',
    },
    '::after': {
      display: 'none',
    },
  },
})
