import { duration } from '@/themes/duration.stylex'
import { easing } from '@/themes/easing.stylex'
import type { Placement } from '@floating-ui/react'
import { forwardRef } from 'react'
import { css, html } from 'react-strict-dom'
import type { TransitionStatus } from 'react-transition-group'
import type { SxProps } from '../types'
import { getPlacementSideTransformOrigin } from './getPlacementSideTransformOrigin'
import { getPlacementTransformOrigin } from './getPlacementTransformOrigin'

export type IFloatingTransitionStatus = 'unmounted' | 'initial' | 'open' | 'close'

export type IFloatingTransitionOrigin = 'center' | 'corner' | 'edge' | 'cursor'

export type IOrientation = 'vertical' | 'horizontal'

export type IFloatingTransitionPattern = 'enterExit' | 'enterExitOffScreen'

export type Props = {
  sx?: SxProps
  children: React.ReactNode
  placement: Placement
  status: IFloatingTransitionStatus | TransitionStatus
  origin?: IFloatingTransitionOrigin
  orientation?: IOrientation
  cursorTransformOrigin?: string
  pattern?: IFloatingTransitionPattern
  disabled?: boolean
}

const resolveStatus = (status: TransitionStatus | IFloatingTransitionStatus): IFloatingTransitionStatus => {
  switch (status) {
    case 'entering':
      return 'open'
    case 'entered':
      return 'open'
    case 'exiting':
      return 'close'
    case 'exited':
      return 'close'
    case 'unmounted':
      return 'unmounted'
  }

  return status
}

export const FloatingTransition = forwardRef<HTMLDivElement, Props>(function FloatingTransition(props, forwardedRef) {
  const {
    sx,
    children,
    placement,
    status,
    origin = 'center',
    cursorTransformOrigin,
    pattern = 'enterExit',
    orientation: orientationProp,
    disabled,
    ...other
  } = props

  const orientation =
    orientationProp ??
    (['top', 'bottom'].includes(placement)
      ? 'vertical'
      : ['left', 'right'].includes(placement)
        ? 'horizontal'
        : undefined)
  const resolvedStatus = resolveStatus(status)

  return (
    <html.div
      {...other}
      data-pattern={`${pattern}-${placement}`}
      style={[
        !disabled && styles[`transition$${resolvedStatus}`],
        !!orientation && styles[`transition$${resolvedStatus}$${orientation}`],
        !disabled &&
          styles.transformOrigin(
            origin === 'corner'
              ? getPlacementTransformOrigin(placement)
              : origin === 'edge'
                ? getPlacementSideTransformOrigin(placement)
                : origin === 'cursor' && cursorTransformOrigin
                  ? cursorTransformOrigin
                  : 'center',
          ),
        sx,
      ]}
      ref={forwardedRef}>
      {children}
    </html.div>
  )
})

const styles = css.create({
  transformOrigin: (x: string) => ({ transformOrigin: x }),
  transition$unmounted: {},
  transition$unmounted$horizontal: {},
  transition$unmounted$vertical: {},
  transition$initial: {
    opacity: 0,
    transform: {
      default: 'unset',
      ':is([data-pattern^="enterExit"])': 'scale(0.5)',
      ':is([data-pattern^="enterExitOffScreen"])': 'translate(-100%, -100%)',
    },
  },
  transition$initial$horizontal: {
    transform: {
      default: 'unset',
      ':is([data-pattern^="enterExit"])': 'scaleX(0.5)',
      ':is([data-pattern^="enterExitOffScreen-left"])': 'translateX(-100%)',
      ':is([data-pattern^="enterExitOffScreen-right"])': 'translateX(130%)',
    },
  },
  transition$initial$vertical: {
    transform: {
      default: 'unset',
      ':is([data-pattern^="enterExit"])': 'scaleY(0.75)',
      ':is([data-pattern^="enterExitOffScreen-top"])': 'translateY(-130%)',
      ':is([data-pattern^="enterExitOffScreen-bottom"])': 'translateY(130%)',
    },
  },
  transition$open: {
    opacity: 1,
    transform: {
      default: 'unset',
      ':is([data-pattern^="enterExit"])': 'scale(1)',
      ':is([data-pattern^="enterExitOffScreen"])': 'translate(0)',
    },
    transitionProperty: {
      default: 'opacity',
      ':is([data-pattern^="enterExit"])': 'opacity, transform',
    },
    transitionDuration: duration.short2,
    transitionTimingFunction: easing.emphasizedDecelerate,
  },
  transition$open$horizontal: {
    transform: {
      default: 'unset',
      ':is([data-pattern^="enterExit"])': 'scaleX(1)',
      ':is([data-pattern^="enterExitOffScreen"])': 'translateX(0)',
    },
  },
  transition$open$vertical: {
    transform: {
      default: 'unset',
      ':is([data-pattern^="enterExit"])': 'scaleY(1)',
      ':is([data-pattern^="enterExitOffScreen"])': 'translateY(0)',
    },
  },
  transition$close: {
    opacity: 0,
    transform: {
      default: 'unset',
      ':is([data-pattern^="enterExit"])': 'scale(0.5)',
      ':is([data-pattern^="enterExitOffScreen"])': 'translate(-100% -100%)',
    },
    transitionProperty: {
      default: 'opacity',
      ':is([data-pattern^="enterExit"])': 'opacity, transform',
    },
    transitionDuration: duration.short2,
    transitionTimingFunction: easing.emphasizedAccelerate,
  },
  transition$close$horizontal: {
    transform: {
      default: 'unset',
      ':is([data-pattern^="enterExit"])': 'scaleX(0.5)',
      ':is([data-pattern^="enterExitOffScreen-left"])': 'translateX(-100%)',
      ':is([data-pattern^="enterExitOffScreen-right"])': 'translateX(130%)',
    },
  },
  transition$close$vertical: {
    transform: {
      default: 'unset',
      ':is([data-pattern^="enterExit"])': 'scaleY(0.75)',
      ':is([data-pattern^="enterExitOffScreen-top"])': 'translateY(-130%)',
      ':is([data-pattern^="enterExitOffScreen-bottom"])': 'translateY(130%)',
    },
  },
})
