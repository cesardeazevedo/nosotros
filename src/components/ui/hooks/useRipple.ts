import { useCallback, useEffect, useRef, useState } from 'react'

export type IPoint = {
  x: number
  y: number
}

export type IVisualState = {
  hovered?: boolean
  focused?: boolean
  pressed?: boolean
  dragged?: boolean
  strategy?: 'accumulate' | 'override' | 'replace'
}

export const EASING = {
  STANDARD: 'cubic-bezier(0.2, 0, 0, 1)',
  STANDARD_ACCELERATE: 'cubic-bezier(.3,0,1,1)',
  STANDARD_DECELERATE: 'cubic-bezier(0,0,0,1)',
  EMPHASIZED: 'cubic-bezier(.3,0,0,1)',
  EMPHASIZED_ACCELERATE: 'cubic-bezier(.3,0,.8,.15)',
  EMPHASIZED_DECELERATE: 'cubic-bezier(.05,.7,.1,1)',
} as const

export type IUseRippleProps = {
  for?: React.RefObject<HTMLElement | null>
  visualState?: IVisualState
  disabled?: boolean
}

export type IUseRippleResult = {
  setHostRef: (host: HTMLDivElement | null) => void
  surfaceRef: React.RefObject<HTMLDivElement | null>
  pressed: boolean
}

const PRESS_GROW_MS = 250
const MINIMUM_PRESS_MS = 50
const INITIAL_ORIGIN_SCALE = 0.09
const PADDING = 10
const SOFT_EDGE_MINIMUM_SIZE = 95
const SOFT_EDGE_CONTAINER_RATIO = 0.35
const PRESS_PSEUDO = '::after'
const ANIMATION_FILL = 'forwards'

/**
 * Delay reacting to touch so that we do not show the ripple for a swipe or
 * scroll interaction.
 */
const TOUCH_DELAY_MS = 50

/**
 * Interaction states for the ripple.
 *
 * On Touch:
 *  - `Inactive -> TouchDelay -> WaitingForClick -> Inactive`
 *  - `Inactive -> TouchDelay -> HOLDING -> WaitingForClick -> Inactive`
 *
 * On Mouse or Pen:
 *   - `Inactive -> WaitingForClick -> Inactive`
 */
enum IState {
  /**
   * Initial state of the control, no touch in progress.
   *
   * Transitions:
   *   - on touch down: transition to `TouchDelay`.
   *   - on mouse down: transition to `WaitingForClick`.
   */
  Inactive,

  /**
   * Touch down has been received, waiting to determine if it's a swipe or
   * scroll.
   *
   * Transitions:
   *   - on touch up: begin press; transition to `WaitingForClick`.
   *   - on cancel: transition to `Inactive`.
   *   - after `TouchDelay_MS`: begin press; transition to `HOLDING`.
   */
  TouchDelay,

  /**
   * A touch has been deemed to be a press
   *
   * Transitions:
   *  - on up: transition to `WaitingForClick`.
   */
  Holding,

  /**
   * The user touch has finished, transition into rest state.
   *
   * Transitions:
   *   - on click end press; transition to `Inactive`.
   */
  WaitingForClick,
}

const isTouch = ({ pointerType }: PointerEvent): boolean => pointerType === 'touch'

// Used to handle overlapping surfaces.
let activeTarget: EventTarget | null = null

export const useRipple = ({ visualState, for: forElementRef, disabled }: IUseRippleProps): IUseRippleResult => {
  const [pressed, setPressed] = useState(false)
  const [hostRef, setHostRef] = useState<HTMLDivElement | null>()

  const rippleStartEventRef = useRef<PointerEvent>(null)
  const stateRef = useRef<IState>(IState.Inactive)
  const initialSizeRef = useRef(0)
  const rippleScaleRef = useRef(1)
  const rippleSizeRef = useRef(0)
  const surfaceRef = useRef<HTMLDivElement>(null)
  const checkBoundsAfterContextMenuRef = useRef(false)
  const growAnimationRef = useRef<Animation>(null)

  const getControl = useCallback(() => forElementRef?.current ?? hostRef?.parentElement, [forElementRef, hostRef])

  const inBounds = useCallback(
    (event: PointerEvent): boolean => {
      if (!hostRef) {
        return false
      }

      const { top, left, bottom, right } = hostRef.getBoundingClientRect()
      const x = event.clientX - left
      const y = event.clientY - top

      return x >= left && x <= right && y >= top && y <= bottom
    },
    [hostRef],
  )

  /**
   * Returns `true` if
   *  - the ripple element is enabled
   *  - the pointer is primary for the input type
   *  - the pointer is the pointer that started the interaction, or will start
   * the interaction
   *  - the pointer is a touch, or the pointer state has the primary button
   * held, or the pointer is hovering
   */
  const shouldReactToEvent = useCallback(
    (event: PointerEvent) => {
      if (visualState?.dragged || disabled || !event.isPrimary) {
        return false
      }

      if (event.type === 'pointerenter' || event.type === 'pointerleave') {
        return !isTouch(event)
      }

      const isPrimaryButton = event.buttons === 1
      if (!isTouch(event) && !isPrimaryButton) {
        return false
      }

      return true
    },
    [visualState?.dragged, disabled],
  )

  const determineRippleSize = useCallback(() => {
    if (!hostRef) {
      return
    }

    const { height, width } = hostRef.getBoundingClientRect()
    const maxDim = Math.max(height, width)
    const softEdgeSize = Math.max(SOFT_EDGE_CONTAINER_RATIO * maxDim, SOFT_EDGE_MINIMUM_SIZE)

    const initialSize = Math.floor(maxDim * INITIAL_ORIGIN_SCALE)
    const hypotenuse = Math.sqrt(width ** 2 + height ** 2)
    const maxRadius = hypotenuse + PADDING

    initialSizeRef.current = initialSize
    rippleScaleRef.current = (maxRadius + softEdgeSize) / initialSize
    rippleSizeRef.current = initialSize
  }, [hostRef])

  const getNormalizedPointerEventCoords = useCallback(
    (pointerEvent: PointerEvent): IPoint | null => {
      if (!hostRef) {
        return null
      }

      const { scrollX, scrollY } = window
      const { left, top } = hostRef.getBoundingClientRect()
      const documentX = scrollX + left
      const documentY = scrollY + top
      const { pageX, pageY } = pointerEvent

      return {
        x: pageX - documentX,
        y: pageY - documentY,
      }
    },
    [hostRef],
  )

  const getTranslationCoordinates = useCallback(
    (
      positionEvent?: PointerEvent | MouseEvent,
    ): {
      startPoint: IPoint
      endPoint: IPoint
    } | null => {
      if (!hostRef) {
        return null
      }

      const { width, height } = hostRef.getBoundingClientRect()
      // End in the center
      const endPoint = {
        x: (width - initialSizeRef.current) / 2,
        y: (height - initialSizeRef.current) / 2,
      }

      const startPoint = (positionEvent
        ? getNormalizedPointerEventCoords(positionEvent as PointerEvent)
        : undefined) ?? {
        x: width / 2,
        y: height / 2,
      }

      // Center around start point
      const centeredStartPoint = {
        x: startPoint.x - initialSizeRef.current / 2,
        y: startPoint.y - initialSizeRef.current / 2,
      }

      return { startPoint: centeredStartPoint, endPoint }
    },
    [hostRef, getNormalizedPointerEventCoords],
  )

  const startPressAnimation = useCallback(
    (_: PointerEvent | MouseEvent, positionEvent?: PointerEvent | MouseEvent): void => {
      if (!surfaceRef.current) {
        return
      }

      setPressed(true)
      growAnimationRef.current?.cancel()
      determineRippleSize()
      const translationCoordinates = getTranslationCoordinates(positionEvent)
      if (!translationCoordinates) {
        return
      }

      const { startPoint, endPoint } = translationCoordinates
      const translateStart = `${startPoint.x}px, ${startPoint.y}px`
      const translateEnd = `${endPoint.x}px, ${endPoint.y}px`
      const size = `${rippleSizeRef.current}px`

      growAnimationRef.current = surfaceRef.current.animate(
        {
          top: [0, 0],
          left: [0, 0],
          height: [size, size],
          width: [size, size],
          transform: [
            `translate(${translateStart}) scale(1)`,
            `translate(${translateEnd}) scale(${rippleScaleRef.current})`,
          ],
        },
        {
          pseudoElement: PRESS_PSEUDO,
          duration: PRESS_GROW_MS,
          easing: EASING.STANDARD,
          fill: ANIMATION_FILL,
        },
      )
    },
    [getTranslationCoordinates, determineRippleSize],
  )

  const endPressAnimation = useCallback(async () => {
    activeTarget = null
    stateRef.current = IState.Inactive
    const animation = growAnimationRef.current

    const pressAnimationPlayState =
      typeof animation?.currentTime === 'number'
        ? animation.currentTime
        : animation?.currentTime
          ? animation.currentTime.to('ms').value
          : Infinity

    if (pressAnimationPlayState >= MINIMUM_PRESS_MS) {
      setPressed(false)

      return
    }

    await new Promise((resolve) => {
      setTimeout(resolve, MINIMUM_PRESS_MS - pressAnimationPlayState)
    })

    if (growAnimationRef.current !== animation) {
      // A new press animation was started. The old animation was canceled and
      // should not finish the pressed state.
      return
    }

    setPressed(false)
  }, [])

  const handlePointerLeave = useCallback(
    (event: PointerEvent) => {
      if (!shouldReactToEvent(event)) {
        return
      }

      // Release a held mouse or pen press that moves outside the element.
      if (stateRef.current !== IState.Inactive) {
        void endPressAnimation()
      }
    },
    [shouldReactToEvent, endPressAnimation],
  )

  const handlePointerDown = useCallback(
    (event: PointerEvent): void => {
      if (!!activeTarget || visualState?.pressed || !shouldReactToEvent(event)) {
        return
      }

      activeTarget = event.target

      rippleStartEventRef.current = event
      if (!isTouch(event)) {
        stateRef.current = IState.WaitingForClick
        startPressAnimation(event, event)

        return
      }

      // After a longpress contextmenu event, an extra `pointerdown` can be
      // dispatched to the pressed element. Check that the down is within
      // bounds of the element in this case.
      if (checkBoundsAfterContextMenuRef.current && !inBounds(event)) {
        return
      }

      checkBoundsAfterContextMenuRef.current = false

      // Wait for a hold after touch delay
      stateRef.current = IState.TouchDelay
      void new Promise((resolve) => {
        setTimeout(resolve, TOUCH_DELAY_MS)
      }).then(() => {
        if (stateRef.current !== IState.TouchDelay) {
          return
        }

        stateRef.current = IState.Holding
        startPressAnimation(event, event)
      })
    },
    [visualState?.pressed, shouldReactToEvent, startPressAnimation, inBounds],
  )

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      if (!shouldReactToEvent(event)) {
        return
      }

      if (stateRef.current === IState.Holding) {
        stateRef.current = IState.WaitingForClick

        return
      }

      if (stateRef.current === IState.TouchDelay) {
        stateRef.current = IState.WaitingForClick
        if (rippleStartEventRef.current) {
          startPressAnimation(event, rippleStartEventRef.current)
        }

        return
      }
    },
    [shouldReactToEvent, startPressAnimation],
  )

  const handlePointerCancel = useCallback(
    (event: PointerEvent): void => {
      if (!shouldReactToEvent(event)) {
        return
      }

      void endPressAnimation()
    },
    [shouldReactToEvent, endPressAnimation],
  )

  const handleClick = useCallback(
    (event: MouseEvent) => {
      // Click is a MouseEvent in Firefox and Safari, so we cannot use
      // `shouldReactToEvent`.
      if (visualState?.pressed || visualState?.dragged || disabled) {
        return
      }

      if (stateRef.current === IState.WaitingForClick) {
        void endPressAnimation()

        return
      }

      if (!!activeTarget && stateRef.current === IState.Inactive) {
        activeTarget = event.target

        // Keyboard synthesized click event
        startPressAnimation(event)
        void endPressAnimation()
      }
    },
    [visualState?.pressed, visualState?.dragged, disabled, startPressAnimation, endPressAnimation],
  )

  const handleContextMenu = useCallback(() => {
    if (disabled) {
      return
    }

    checkBoundsAfterContextMenuRef.current = true
    void endPressAnimation()
  }, [disabled, endPressAnimation])

  useEffect(() => {
    const control = getControl()
    if (!control) {
      return
    }

    control.addEventListener('pointerleave', handlePointerLeave)
    control.addEventListener('pointerdown', handlePointerDown)
    control.addEventListener('pointerup', handlePointerUp)
    control.addEventListener('pointercancel', handlePointerCancel)
    control.addEventListener('click', handleClick)
    control.addEventListener('contextmenu', handleContextMenu)

    return () => {
      control.removeEventListener('pointerleave', handlePointerLeave)
      control.removeEventListener('pointerdown', handlePointerDown)
      control.removeEventListener('pointerup', handlePointerUp)
      control.removeEventListener('pointercancel', handlePointerCancel)
      control.removeEventListener('click', handleClick)
      control.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [
    getControl,
    handlePointerLeave,
    handlePointerDown,
    handlePointerUp,
    handlePointerCancel,
    handleClick,
    handleContextMenu,
  ])

  return { setHostRef, surfaceRef, pressed }
}
