// from https://github.com/mui/material-ui/blob/master/packages/mui-material/src/Slide/Slide.js
import debounce from '@mui/utils/debounce'
import * as React from 'react'
import { Transition } from 'react-transition-group'
import type { TransitionActions } from 'react-transition-group/Transition'
import type { TransitionProps } from '../Drawer/utils'
import { getTransitionProps, ownerWindow } from '../Drawer/utils'
import { mergeRefs } from '../helpers/mergeRefs'
import { vars as easingVars } from '@/themes/easing.stylex'

type Direction = 'down' | 'left' | 'right' | 'up'
type Easing = string | { enter: string; exit: string }
type Timeout = number | { appear?: number; enter?: number; exit?: number }

export interface Props extends TransitionActions {
  addEndListener?: (node: HTMLElement, done: () => void) => void
  appear?: boolean
  children: React.ReactElement
  container?: null | (() => HTMLElement) | HTMLElement
  direction?: Direction
  easing?: Easing
  in?: boolean
  onEnter?: (node: HTMLElement, isAppearing: boolean) => void
  onEntered?: (node: HTMLElement, isAppearing: boolean) => void
  onEntering?: (node: HTMLElement, isAppearing: boolean) => void
  onExit?: (node: HTMLElement) => void
  onExited?: (node: HTMLElement) => void
  onExiting?: (node: HTMLElement) => void
  style?: React.CSSProperties
  timeout?: Timeout
  TransitionComponent?: React.ComponentType
}

const reflow = (node: Element) => node.scrollTop

function getTranslateValue(direction: Direction, node: HTMLElement, resolvedContainer?: HTMLElement | null): string {
  const rect = node.getBoundingClientRect()
  const containerRect = resolvedContainer && resolvedContainer.getBoundingClientRect()
  const containerWindow = ownerWindow(node)
  let transform

  // @ts-ignore
  if (node.fakeTransform) {
    // @ts-ignore
    transform = node.fakeTransform
  } else {
    const computedStyle = containerWindow.getComputedStyle(node)
    transform = computedStyle.getPropertyValue('-webkit-transform') || computedStyle.getPropertyValue('transform')
  }

  let offsetX = 0
  let offsetY = 0

  if (transform && transform !== 'none' && typeof transform === 'string') {
    const transformValues = transform.split('(')[1].split(')')[0].split(',')
    offsetX = parseInt(transformValues[4], 10)
    offsetY = parseInt(transformValues[5], 10)
  }

  if (direction === 'left') {
    if (containerRect) {
      return `translateX(${containerRect.right + offsetX - rect.left}px)`
    }
    return `translateX(${containerWindow.innerWidth + offsetX - rect.left}px)`
  }

  if (direction === 'right') {
    if (containerRect) {
      return `translateX(-${rect.right - containerRect.left - offsetX}px)`
    }
    return `translateX(-${rect.left + rect.width - offsetX}px)`
  }

  if (direction === 'up') {
    if (containerRect) {
      return `translateY(${containerRect.bottom + offsetY - rect.top}px)`
    }
    return `translateY(${containerWindow.innerHeight + offsetY - rect.top}px)`
  }

  // direction === 'down'
  if (containerRect) {
    return `translateY(-${rect.top - containerRect.top + rect.height - offsetY}px)`
  }
  return `translateY(-${rect.top + rect.height - offsetY}px)`
}

function resolveContainer(containerProp: Props['container']): HTMLElement | null | undefined {
  return typeof containerProp === 'function' ? containerProp() : containerProp
}

function setTranslateValue(direction: Direction, node: HTMLElement, containerProp: Props['container']): void {
  const resolvedContainer = resolveContainer(containerProp)
  const transform = getTranslateValue(direction, node, resolvedContainer)

  if (transform) {
    node.style.webkitTransform = transform
    node.style.transform = transform
  }
}

const Slide = React.forwardRef<HTMLElement, Props>(function Slide(props, ref) {
  const defaultEasing = {
    enter: easingVars.emphasizedDecelerate,
    exit: easingVars.emphasizedDecelerate,
  }

  const defaultTimeout = {
    enter: 225,
    exit: 195,
  }

  const {
    addEndListener,
    appear = true,
    children,
    container: containerProp,
    direction = 'down',
    easing: easingProp = defaultEasing,
    in: inProp,
    onEnter,
    onEntered,
    onEntering,
    onExit,
    onExited,
    onExiting,
    style,
    timeout = defaultTimeout,
    TransitionComponent = Transition,
    ...other
  } = props

  const childrenRef = React.useRef<HTMLElement>(null)
  // External dependency: Replace with your own implementation
  const handleRef = mergeRefs([childrenRef, ref])

  const normalizedTransitionCallback =
    (callback?: (node: HTMLElement, isAppearing: boolean) => void) => (isAppearing?: boolean) => {
      if (callback) {
        // onEnterXxx and onExitXxx callbacks have a different arguments.length value.
        if (isAppearing === undefined) {
          callback(childrenRef.current!, isAppearing!)
        } else {
          callback(childrenRef.current!, isAppearing)
        }
      }
    }

  const handleEnter = normalizedTransitionCallback((node, isAppearing) => {
    setTranslateValue(direction, node, containerProp)
    reflow(node)

    if (onEnter) {
      onEnter(node, isAppearing)
    }
  })

  const handleEntering = normalizedTransitionCallback((node, isAppearing) => {
    const transitionProps = getTransitionProps(
      { timeout, style, easing: easingProp },
      {
        mode: 'enter',
      },
    )
    node.style.webkitTransition = createTransition('-webkit-transform', transitionProps)
    node.style.transition = createTransition('transform', transitionProps)

    node.style.webkitTransform = 'none'
    node.style.transform = 'none'
    if (onEntering) {
      onEntering(node, isAppearing)
    }
  })

  const handleEntered = normalizedTransitionCallback(onEntered)
  const handleExiting = normalizedTransitionCallback(onExiting)

  const handleExit = normalizedTransitionCallback((node) => {
    const transitionProps = getTransitionProps({ timeout, style, easing: easingProp }, { mode: 'exit' })

    node.style.webkitTransition = createTransition('-webkit-transform', transitionProps)
    node.style.transition = createTransition('transform', transitionProps)

    setTranslateValue(direction, node, containerProp)

    if (onExit) {
      onExit(node)
    }
  })

  const handleExited = normalizedTransitionCallback((node) => {
    // No need for transitions when the component is hidden
    node.style.webkitTransition = ''
    node.style.transition = ''

    if (onExited) {
      onExited(node)
    }
  })

  const handleAddEndListener = (next: () => void) => {
    if (addEndListener) {
      // Old call signature before `react-transition-group` implemented `nodeRef`
      addEndListener(childrenRef.current!, next)
    }
  }

  const updatePosition = React.useCallback(() => {
    if (childrenRef.current) {
      setTranslateValue(direction, childrenRef.current, containerProp)
    }
  }, [direction, containerProp])

  React.useEffect(() => {
    // Skip configuration where the position is screen size invariant.
    if (inProp || direction === 'down' || direction === 'right') {
      return undefined
    }

    const handleResize = debounce(() => {
      if (childrenRef.current) {
        setTranslateValue(direction, childrenRef.current, containerProp)
      }
    })

    const containerWindow = ownerWindow(childrenRef.current!)
    containerWindow.addEventListener('resize', handleResize)
    return () => {
      handleResize.clear()
      containerWindow.removeEventListener('resize', handleResize)
    }
  }, [direction, inProp, containerProp])

  React.useEffect(() => {
    if (!inProp) {
      // We need to update the position of the drawer when the direction change and
      // when it's hidden.
      updatePosition()
    }
  }, [inProp, updatePosition])

  return (
    <TransitionComponent
      nodeRef={childrenRef}
      onEnter={handleEnter}
      onEntered={handleEntered}
      onEntering={handleEntering}
      onExit={handleExit}
      onExited={handleExited}
      onExiting={handleExiting}
      addEndListener={handleAddEndListener}
      appear={appear}
      in={inProp}
      timeout={timeout}
      {...other}>
      {(state: string, childProps) => {
        return React.cloneElement(children, {
          ref: handleRef,
          style: {
            visibility: state === 'exited' && !inProp ? 'hidden' : undefined,
            ...style,
            ...children.props.style,
          },
          ...childProps,
        })
      }}
    </TransitionComponent>
  )
})

function createTransition(props: string, transitionProps: TransitionProps): string {
  return `${props} ${transitionProps.duration}ms ${transitionProps.easing} 0ms`
}

export default Slide
