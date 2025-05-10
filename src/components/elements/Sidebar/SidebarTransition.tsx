import type { SxProps } from '@/components/ui/types'
import { duration } from '@/themes/duration.stylex'
import { easing } from '@/themes/easing.stylex'
import React, { useRef } from 'react'
import { css } from 'react-strict-dom'
import { Transition } from 'react-transition-group'

type Props = {
  open: boolean
  timeout?: number
  children: (transitionStyle: SxProps, ref: React.RefObject<null>) => React.ReactNode
}

export const SidebarTransition = (props: Props) => {
  const { open, timeout = 2000, children } = props
  const ref = useRef(null)
  return (
    <Transition nodeRef={ref} in={open} timeout={timeout} unmountOnExit>
      {(state) => children([styles.root, styles[state]], ref)}
    </Transition>
  )
}

const styles = css.create({
  root: {
    transitionProperty: `margin-left`,
    transitionDuration: duration.medium2,
    transitionTimingFunction: easing.emphasizedDecelerate,
  },
  entering: { marginLeft: 0 },
  entered: { marginLeft: 0 },
  exiting: { marginLeft: -500 },
  exited: { marginLeft: -500 },
  unmounted: {},
})
