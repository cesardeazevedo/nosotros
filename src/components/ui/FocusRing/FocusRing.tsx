import { duration } from '@/themes/duration.stylex'
import { easing } from '@/themes/easing.stylex'
import { outline } from '@/themes/outline.stylex'
import { scale } from '@/themes/scale.stylex'
import { useCallback, useEffect, useRef, useState } from 'react'
import { css, html } from 'react-strict-dom'
import type { IVisualState } from '../hooks/useRipple'
import type { SxProps } from '../types'
import { focusRingTokens } from './FocusRing.stylex'

type Props = {
  sx?: SxProps
  visualState?: IVisualState
  element?: React.RefObject<HTMLElement | null>
  inward?: boolean
}

const HANDLED_BY_FOCUS_RING = Symbol('handledByFocusRing')

type IFocusRingEvent = Event & {
  [HANDLED_BY_FOCUS_RING]?: true
}

export const FocusRing = function FocusRing(props: Props) {
  const { sx, visualState, element, inward } = props
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  const getControl = useCallback(() => element?.current ?? ref?.current?.parentElement, [element])

  const handleEvent = useCallback(
    (event: IFocusRingEvent): void => {
      if (event[HANDLED_BY_FOCUS_RING]) {
        // This ensures the focus ring does not activate when multiple focus rings
        // are used within a single component.
        return
      }

      const control = getControl()

      switch (event.type) {
        case 'focus':
          setVisible(control?.matches(':focus-visible') ?? false)
          break

        case 'blur':
        case 'pointerdown':
          setVisible(false)
          break
      }

      event[HANDLED_BY_FOCUS_RING] = true
    },
    [getControl],
  )

  useEffect(() => {
    const control = getControl()
    if (!control) {
      return
    }

    const events = ['focus', 'blur', 'pointerdown'] as const
    events.forEach((event) => control.addEventListener(event, handleEvent))

    return () => events.forEach((event) => control.removeEventListener(event, handleEvent))
  }, [getControl, handleEvent])

  const visibleOnInit = visualState?.focused

  return (
    <html.div
      ref={ref}
      style={[styles.root, (visible || visibleOnInit) && styles.visible, inward ? styles.inward : styles.outward, sx]}
    />
  )
}

const inwardGrowKeyframes = css.keyframes({
  '0%': { borderWidth: 0 },
  '100%': { borderWidth: outline.xl },
})

const inwardShrinkKeyframes = css.keyframes({
  '0%': { borderWidth: outline.xl },
})

const outwardGrowKeyframes = css.keyframes({
  '0%': { outlineWidth: 0 },
  '100%': { outlineWidth: outline.xl },
})

const outwardShrinkKeyframes = css.keyframes({
  '0%': { outlineWidth: outline.xl },
})

const styles = css.create({
  root: {
    animationDelay: `0s, calc(${duration.long4} * 0.25)`,
    animationDuration: `calc(${duration.long4} * 0.25), calc(${duration.long4} * 0.75)`,
    animationTimingFunction: easing.emphasized,
    color: focusRingTokens.color,
    display: 'none',
    pointerEvents: 'none',
    position: 'absolute',
    zIndex: 9999,
  },
  visible: {
    display: 'flex',
  },
  outward: {
    animationName: `${outwardGrowKeyframes}, ${outwardShrinkKeyframes}`,
    borderRadius: focusRingTokens.shape,
    outline: `${focusRingTokens.width} solid currentColor`,
    inset: `calc(-1 * calc(2px * ${scale.scale}))`,
  },
  inward: {
    animationName: `${inwardGrowKeyframes}, ${inwardShrinkKeyframes}`,
    borderRadius: focusRingTokens.shape,
    borderWidth: focusRingTokens.width,
    borderStyle: 'solid',
    borderColor: 'currentColor',
    inset: '0px',
  },
})
