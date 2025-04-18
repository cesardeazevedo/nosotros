import { duration } from '@/themes/duration.stylex'
import { easing } from '@/themes/easing.stylex'
import type { FloatingContext, FloatingOverlayProps } from '@floating-ui/react'
import { FloatingOverlay, useTransitionStatus } from '@floating-ui/react'
import { forwardRef } from 'react'
import { RemoveScroll } from 'react-remove-scroll'
import { css } from 'react-strict-dom'
import type { SxProps } from '../types'
import { scrimTokens } from './Scrim.stylex'

export type Variant = 'darken' | 'lighten'

export type Props = FloatingOverlayProps & {
  sx?: SxProps
  floatingContext: FloatingContext
  variant?: Variant
  children?: React.ReactNode
}

export const Scrim = forwardRef<HTMLDivElement, Props>(function Scrim(props, forwardedRef) {
  const { floatingContext, sx, variant = 'darken', children, ...other } = props

  const transitionStatus = useTransitionStatus(floatingContext, { duration: 150 })

  if (!transitionStatus.isMounted) {
    return null
  }

  return (
    <FloatingOverlay
      {...css.props(
        styles.root,
        other.lockScroll && styles[variant],
        styles[`transition$${transitionStatus.status}`],
        sx,
      )}
      {...other}
      lockScroll={false}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
      }}
      ref={forwardedRef}>
      {other.lockScroll && <RemoveScroll noIsolation>{children}</RemoveScroll>}
    </FloatingOverlay>
  )
})

const styles = css.create({
  root: {
    display: 'grid',
    placeItems: 'center',
    pointerEvents: 'auto',
  },
  darken: {
    backgroundColor: scrimTokens.containerColor$darken,
  },
  lighten: {
    backgroundColor: scrimTokens.containerColor$lighten,
  },
  transition$unmounted: {},
  transition$initial: {
    opacity: 0,
  },
  transition$open: {
    opacity: 1,
    transitionProperty: 'opacity',
    transitionDuration: duration.long3,
    transitionTimingFunction: easing.emphasizedDecelerate,
  },
  transition$close: {
    opacity: 0,
    transitionProperty: 'opacity',
    transitionDuration: duration.short3,
    transitionTimingFunction: easing.emphasizedAccelerate,
  },
})
