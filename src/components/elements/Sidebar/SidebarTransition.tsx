import type { SxProps } from '@/components/ui/types'
import React, { useRef } from 'react'
import { css } from 'react-strict-dom'
import { Transition } from 'react-transition-group'

type Props = {
  open: boolean
  timeout?: number
  children: (transitionStyle: SxProps, ref: React.RefObject<null>) => React.ReactNode
}

const duration = 230

export const SidebarTransition = (props: Props) => {
  const { open, timeout = duration, children } = props
  const ref = useRef(null)
  return (
    <Transition nodeRef={ref} in={open} timeout={timeout} unmountOnExit>
      {(state) => children([styles.root, styles[state]], ref)}
    </Transition>
  )
}

const styles = css.create({
  root: {
    transition: `margin-left ${duration}ms ease-out`,
  },
  entering: { marginLeft: 0 },
  entered: { marginLeft: 0 },
  exiting: { marginLeft: -315 },
  exited: { marginLeft: -315 },
  unmounted: {},
})
