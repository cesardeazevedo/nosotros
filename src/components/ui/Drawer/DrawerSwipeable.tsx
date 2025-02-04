// Adapted from github.com/mui/material-ui/blob/master/packages/mui-material/src/SwipeableDrawer/SwipeableDrawer.js
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { useEventCallback } from '../hooks/useEventCallback'
import type { Props as DrawerProps } from './Drawer'
import { Drawer } from './Drawer'
import {
  calculateCurrentX,
  calculateCurrentY,
  computeHasNativeHandler,
  getAnchor,
  getDomTreeShapes,
  getMaxTranslate,
  getTransitionProps,
  getTranslate,
  iOS,
  isHorizontal,
  ownerDocument,
  ownerWindow,
} from './utils'

export type Props = DrawerProps & {
  hysteresis?: number
  disableDiscovery?: boolean
  swipeAreaWidth?: number
  allowSwipeInChildren?: boolean
  minFlingVelocity?: number
  transitionDuration?: {
    enter: number
    exit: number
  }
}

type SwipeableInstance = {
  isSwiping: boolean | null
  startX?: number
  startY?: number
  paperHit?: boolean
  lastTranslate?: number | null
  lastTime?: number | null
  velocity?: number
}

// This value is closed to what browsers are using internally to
// trigger a native scroll.
const UNCERTAINTY_THRESHOLD = 3 // px

// This is the part of the drawer displayed on touch start.
const DRAG_STARTED_SIGNAL = 20 // px

// We can only have one instance at the time claiming ownership for handling the swipe.
// Otherwise, the UX would be confusing.
// That's why we use a singleton here.
let claimedSwipeInstance: boolean | SwipeableInstance | null = null

const transitionDurationDefault = {
  enter: 225,
  exit: 195,
}

export const DrawerSwipeable = (props: Props) => {
  const {
    hysteresis = 0.52,
    swipeAreaWidth = 20,
    minFlingVelocity = 450,
    disableDiscovery = false,
    allowSwipeInChildren = false,
    transitionDuration = transitionDurationDefault,
    ...rest
  } = props
  const { opened = false, anchor = 'bottom' } = rest

  const floatingRef = useRef<HTMLDivElement>(null)
  const scrimRef = useRef<HTMLDivElement>(null)
  const swipeAreaRef = useRef<HTMLDivElement>(null)
  const touchDetected = useRef(false)

  const [maybeSwiping, setMaybeSwiping] = useState(false)
  const swipeInstance = useRef<SwipeableInstance>({ isSwiping: null })

  const disableSwipeToOpen = iOS

  const calculatedDurationRef = useRef<number>(null)

  useLayoutEffect(() => {
    calculatedDurationRef.current = null
  }, [opened])

  const setPosition = useCallback(
    (translate: number, options: { mode?: 'enter' | 'exit'; changeTransition?: boolean } = {}) => {
      if (!floatingRef.current || !scrimRef.current) {
        return
      }
      const { mode = null, changeTransition = true } = options

      const rtlTranslateMultiplier = ['right', 'bottom'].includes(anchor) ? 1 : -1
      const horizontalSwipe = isHorizontal(anchor)

      const transform = horizontalSwipe
        ? `translate(${rtlTranslateMultiplier * translate}px, 0)`
        : `translate(0, ${rtlTranslateMultiplier * translate}px)`
      const drawerStyle = floatingRef.current.style
      drawerStyle.webkitTransform = transform
      drawerStyle.transform = transform

      let transition = ''

      if (mode) {
        const transitionProps = getTransitionProps(
          { easing: undefined, style: undefined, timeout: transitionDuration },
          { mode },
        )
        transition = `all ${transitionProps.duration}ms ${transitionProps.easing || ''}`
      }

      if (changeTransition) {
        drawerStyle.webkitTransition = transition
        drawerStyle.transition = transition
      }

      const backdropStyle = scrimRef.current.style
      backdropStyle.opacity = (1 - translate / getMaxTranslate(horizontalSwipe, floatingRef.current)).toString()

      if (changeTransition) {
        // @ts-ignore
        backdropStyle.webkitTransition = transition
        backdropStyle.transition = transition
      }
    },
    [anchor, transitionDuration],
  )

  const startMaybeSwiping = (force = false) => {
    if (!maybeSwiping) {
      // on Safari Mobile, if you want to be able to have the 'click' event fired on child elements, nothing in the DOM can be changed.
      // this is because Safari Mobile will not fire any mouse events (still fires touch though) if the DOM changes during mousemove.
      // so do this change on first touchmove instead of touchstart
      if (force || !(disableDiscovery && allowSwipeInChildren)) {
        ReactDOM.flushSync(() => {
          setMaybeSwiping(true)
        })
      }

      const horizontalSwipe = isHorizontal(anchor)

      if (!opened && floatingRef.current) {
        // The ref may be null when a parent component updates while swiping.
        setPosition(
          getMaxTranslate(horizontalSwipe, floatingRef.current) + (disableDiscovery ? 15 : -DRAG_STARTED_SIGNAL),
          {
            changeTransition: false,
          },
        )
      }

      swipeInstance.current.velocity = 0
      swipeInstance.current.lastTime = null
      swipeInstance.current.lastTranslate = null
      swipeInstance.current.paperHit = false

      touchDetected.current = true
    }
  }

  const handleBodyTouchStart = useEventCallback((nativeEvent: TouchEvent) => {
    if (nativeEvent.defaultPrevented) {
      return
    }

    if (!scrimRef.current || !floatingRef.current) {
      return
    }

    // We can only have one node at the time claiming ownership for handling the swipe.
    // @ts-ignore
    if (nativeEvent.defaultMuiPrevented) {
      return
    }

    if (
      opened &&
      !scrimRef.current.contains(nativeEvent.target as Node) &&
      !floatingRef.current.contains(nativeEvent.target as Node)
    ) {
      return
    }

    const anchorRtl = getAnchor(anchor)
    const horizontalSwipe = isHorizontal(anchor)

    const target = nativeEvent.currentTarget as Node
    const ownerDocument = target.ownerDocument || document
    const ownerWindow = ownerDocument.defaultView || window

    const currentX = calculateCurrentX(anchorRtl, nativeEvent.touches, ownerDocument)
    const currentY = calculateCurrentY(anchorRtl, nativeEvent.touches, ownerWindow)

    if (!opened) {
      // logic for if swipe should be ignored:
      // if disableSwipeToOpen
      // if target != swipeArea, and target is not a child of paper ref
      // if is a child of paper ref, and `allowSwipeInChildren` does not allow it
      if (
        disableSwipeToOpen ||
        !(nativeEvent.target === swipeAreaRef.current || floatingRef.current?.contains(nativeEvent.target as Node))
      ) {
        return
      }
      if (horizontalSwipe) {
        if (currentX > swipeAreaWidth) {
          return
        }
      } else if (currentY > swipeAreaWidth) {
        return
      }
    }

    // @ts-ignore
    nativeEvent.defaultMuiPrevented = true
    claimedSwipeInstance = null
    swipeInstance.current.startX = currentX
    swipeInstance.current.startY = currentY

    startMaybeSwiping()
  })

  const handleBodyTouchMove = useEventCallback((nativeEvent: TouchEvent) => {
    if (!floatingRef.current || !touchDetected.current) {
      return
    }

    // We are not supposed to handle this touch move because the swipe was started in a scrollable container in the drawer
    if (claimedSwipeInstance !== null && claimedSwipeInstance !== swipeInstance.current) {
      return
    }

    startMaybeSwiping(true)
    const anchorRtl = getAnchor(anchor)
    const horizontalSwipe = isHorizontal(anchor)

    const target = nativeEvent.currentTarget as Node
    const ownerDocument = target.ownerDocument || document
    const ownerWindow = ownerDocument.defaultView || window

    const currentX = calculateCurrentX(anchorRtl, nativeEvent.touches, ownerDocument)
    const currentY = calculateCurrentY(anchorRtl, nativeEvent.touches, ownerWindow)

    if (opened && floatingRef.current.contains(nativeEvent.target as Element) && claimedSwipeInstance === null) {
      const domTreeShapes = getDomTreeShapes(nativeEvent.target as Element, floatingRef.current)
      const hasNativeHandler = computeHasNativeHandler({
        domTreeShapes,
        start: horizontalSwipe ? swipeInstance.current.startX! : swipeInstance.current!.startY!,
        current: horizontalSwipe ? currentX : currentY,
        anchor,
      })

      if (hasNativeHandler) {
        claimedSwipeInstance = true
        return
      }
      claimedSwipeInstance = swipeInstance.current
    }

    // We don't know yet.
    if (swipeInstance.current.isSwiping == null) {
      const dx = Math.abs(currentX - (swipeInstance.current.startX || 0))
      const dy = Math.abs(currentY - (swipeInstance.current.startY || 0))

      const definitelySwiping = horizontalSwipe
        ? dx > dy && dx > UNCERTAINTY_THRESHOLD
        : dy > dx && dy > UNCERTAINTY_THRESHOLD

      // if (definitelySwiping && nativeEvent.cancelable) {
      //   nativeEvent.preventDefault()
      // }

      if (definitelySwiping === true || (horizontalSwipe ? dy > UNCERTAINTY_THRESHOLD : dx > UNCERTAINTY_THRESHOLD)) {
        swipeInstance.current.isSwiping = definitelySwiping
        if (!definitelySwiping) {
          handleBodyTouchEnd(nativeEvent)
          return
        }

        // Shift the starting point.
        swipeInstance.current.startX = currentX
        swipeInstance.current.startY = currentY

        // Compensate for the part of the drawer displayed on touch start.
        if (disableDiscovery && !opened) {
          if (horizontalSwipe) {
            swipeInstance.current.startX -= DRAG_STARTED_SIGNAL
          } else {
            swipeInstance.current.startY -= DRAG_STARTED_SIGNAL
          }
        }
      }
    }

    if (!swipeInstance.current.isSwiping) {
      return
    }

    const maxTranslate = getMaxTranslate(horizontalSwipe, floatingRef.current)
    let startLocation = horizontalSwipe ? swipeInstance.current.startX : swipeInstance.current.startY
    if (opened && !swipeInstance.current.paperHit) {
      startLocation = Math.min(startLocation || 0, maxTranslate)
    }

    const translate = getTranslate(horizontalSwipe ? currentX : currentY, startLocation || 0, opened, maxTranslate)

    if (opened) {
      if (!swipeInstance.current.paperHit) {
        const paperHit = horizontalSwipe ? currentX < maxTranslate : currentY < maxTranslate
        if (paperHit) {
          swipeInstance.current.paperHit = true
          swipeInstance.current.startX = currentX
          swipeInstance.current.startY = currentY
        } else {
          return
        }
      } else if (translate === 0) {
        swipeInstance.current.startX = currentX
        swipeInstance.current.startY = currentY
      }
    }

    if (swipeInstance.current.lastTranslate === null) {
      swipeInstance.current.lastTranslate = translate
      swipeInstance.current.lastTime = performance.now() + 1
    }

    const velocity =
      ((translate - (swipeInstance.current.lastTranslate || 0)) /
        (performance.now() - (swipeInstance.current.lastTime || 0))) *
      1e3

    // Low Pass filter.
    swipeInstance.current.velocity = (swipeInstance.current.velocity || 1) * 0.4 + velocity * 0.6

    swipeInstance.current.lastTranslate = translate
    swipeInstance.current.lastTime = performance.now()

    // We are swiping, let's prevent the scroll event on iOS.
    if (nativeEvent.cancelable) {
      // try {
      //   //nativeEvent.preventDefault()
      // } catch (error) {
      //   //console.error(error)
      // }
    }

    setPosition(translate)
  })

  const handleBodyTouchEnd = useEventCallback((nativeEvent: TouchEvent) => {
    if (!touchDetected.current) {
      return
    }
    if (!floatingRef.current || !scrimRef.current) {
      return
    }
    claimedSwipeInstance = null
    touchDetected.current = false
    ReactDOM.flushSync(() => {
      setMaybeSwiping(false)
    })
    // The swipe wasn't started.
    if (!swipeInstance.current.isSwiping) {
      swipeInstance.current.isSwiping = null
      return
    }
    swipeInstance.current.isSwiping = null

    const anchorRtl = getAnchor(anchor)
    const horizontal = isHorizontal(anchor)
    let current
    if (horizontal) {
      current = calculateCurrentX(
        anchorRtl,
        nativeEvent.changedTouches,
        ownerDocument(nativeEvent.currentTarget as Node),
      )
    } else {
      current = calculateCurrentY(anchorRtl, nativeEvent.changedTouches, ownerWindow(nativeEvent.currentTarget as Node))
    }

    const startLocation = (horizontal ? swipeInstance.current.startX : swipeInstance.current.startY) || 0
    const maxTranslate = getMaxTranslate(horizontal, floatingRef.current)
    const currentTranslate = getTranslate(current, startLocation, opened, maxTranslate)
    const translateRatio = currentTranslate / maxTranslate

    if (Math.abs(swipeInstance.current.velocity || 0) > minFlingVelocity) {
      // Calculate transition duration to match swipe speed
      calculatedDurationRef.current =
        Math.abs((maxTranslate - currentTranslate) / (swipeInstance.current.velocity || 1)) * 1000
    }

    if (opened) {
      if ((swipeInstance.current.velocity || 0) > minFlingVelocity || translateRatio > hysteresis) {
        scrimRef.current.style.opacity = ''
        rest.onClose?.()
      } else {
        // Reset the position, the swipe was aborted.
        setPosition(0, { mode: 'exit' })
      }
      return
    }
  })

  const handleFloatingRef = useCallback((element: HTMLDivElement) => {
    if (element) {
      floatingRef.current = element
      const doc = floatingRef.current.ownerDocument
      doc.addEventListener('touchstart', handleBodyTouchStart)
      doc.addEventListener('touchmove', handleBodyTouchMove, { passive: !opened })
      doc.addEventListener('touchend', handleBodyTouchEnd)
    } else {
      floatingRef.current = null
    }
  }, [])

  const handleScrimRef = useCallback((element: HTMLDivElement) => {
    scrimRef.current = element
  }, [])

  useEffect(
    () => () => {
      // We need to release the lock.
      if (claimedSwipeInstance === swipeInstance.current) {
        claimedSwipeInstance = null
      }
    },
    [],
  )

  useEffect(() => {
    if (!opened) {
      setMaybeSwiping(false)
    }
  }, [opened])

  return <Drawer {...rest} ref={handleFloatingRef} slotProps={{ scrim: { ref: handleScrimRef }, ...rest.slotProps }} />
}
