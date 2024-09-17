import type { Props as DrawerProps } from './Drawer'

type Anchor = NonNullable<DrawerProps['anchor']>

export const iOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)

const oppositeDirection: Record<Anchor, Anchor> = {
  right: 'right',
  left: 'left',
  top: 'top',
  bottom: 'bottom',
}

export function isHorizontal(anchor: Anchor) {
  return ['left', 'right'].includes(anchor)
}

export function getAnchor(anchor: Anchor) {
  return isHorizontal(anchor) ? oppositeDirection[anchor] : anchor
}

export function calculateCurrentX(anchor: Anchor, touches: TouchList, doc: Document) {
  return anchor === 'right' ? doc.body.offsetWidth - touches[0].pageX : touches[0].pageX
}

export function calculateCurrentY(anchor: Anchor, touches: TouchList, containerWindow: Window) {
  return anchor === 'bottom' ? containerWindow.innerHeight - touches[0].clientY : touches[0].clientY
}

export function ownerDocument(node: Node | null | undefined): Document {
  return (node && node.ownerDocument) || document
}

export function ownerWindow(node: Node | undefined): Window {
  const doc = ownerDocument(node)
  return doc.defaultView || window
}

export function getDomTreeShapes(element: Element, rootNode: Element) {
  // Adapted from https://github.com/oliviertassinari/react-swipeable-views/blob/7666de1dba253b896911adf2790ce51467670856/packages/react-swipeable-views/src/SwipeableViews.js#L129
  const domTreeShapes = []

  while (element && element !== rootNode.parentElement) {
    const style = ownerWindow(rootNode).getComputedStyle(element)

    if (
      // Ignore the scroll children if the element is absolute positioned.
      style.getPropertyValue('position') === 'absolute' ||
      // Ignore the scroll children if the element has an overflowX hidden
      style.getPropertyValue('overflow-x') === 'hidden'
    ) {
      // noop
    } else if (
      (element.clientWidth > 0 && element.scrollWidth > element.clientWidth) ||
      (element.clientHeight > 0 && element.scrollHeight > element.clientHeight)
    ) {
      // Ignore the nodes that have no width.
      // Keep elements with a scroll
      domTreeShapes.push(element)
    }
    // @ts-ignore
    element = element.parentElement
  }

  return domTreeShapes
}

export function computeHasNativeHandler({
  domTreeShapes,
  start,
  current,
  anchor,
}: {
  domTreeShapes: Element[]
  start: number
  current: number
  anchor: Anchor
}) {
  // Adapted from https://github.com/oliviertassinari/react-swipeable-views/blob/7666de1dba253b896911adf2790ce51467670856/packages/react-swipeable-views/src/SwipeableViews.js#L175
  const axisProperties = {
    scrollPosition: {
      x: 'scrollLeft',
      y: 'scrollTop',
    },
    scrollLength: {
      x: 'scrollWidth',
      y: 'scrollHeight',
    },
    clientLength: {
      x: 'clientWidth',
      y: 'clientHeight',
    },
  } as const

  return domTreeShapes.some((shape) => {
    // Determine if we are going backward or forward.
    let goingForward = current >= start
    if (anchor === 'top' || anchor === 'left') {
      goingForward = !goingForward
    }
    const axis = anchor === 'left' || anchor === 'right' ? 'x' : 'y'
    const scrollPosition = Math.round(shape[axisProperties.scrollPosition[axis]])

    const areNotAtStart = scrollPosition > 0
    const areNotAtEnd =
      scrollPosition + shape[axisProperties.clientLength[axis]] < shape[axisProperties.scrollLength[axis]]

    if ((goingForward && areNotAtEnd) || (!goingForward && areNotAtStart)) {
      return true
    }

    return false
  })
}

export function getMaxTranslate(horizontalSwipe: boolean, paperInstance: HTMLDivElement) {
  return horizontalSwipe ? paperInstance.clientWidth : paperInstance.clientHeight
}

export function getTranslate(currentTranslate: number, startLocation: number, open: boolean, maxTranslate: number) {
  return Math.min(
    Math.max(open ? startLocation - currentTranslate : maxTranslate + startLocation - currentTranslate, 0),
    maxTranslate,
  )
}

interface ComponentProps {
  easing: string | { enter?: string; exit?: string } | undefined
  style: React.CSSProperties | undefined
  timeout: number | { enter?: number; exit?: number }
}

interface Options {
  mode: 'enter' | 'exit'
}

export interface TransitionProps {
  duration: string | number
  easing: string | undefined
  delay: string | undefined
}

export function getTransitionProps(props: ComponentProps, options: Options): TransitionProps {
  const { timeout, easing, style = {} } = props

  return {
    duration: style.transitionDuration ?? (typeof timeout === 'number' ? timeout : timeout[options.mode] || 0),
    easing: style.transitionTimingFunction ?? (typeof easing === 'object' ? easing[options.mode] : easing),
    delay: style.transitionDelay,
  }
}
