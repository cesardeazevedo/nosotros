import type { Ref } from 'react'
import { useCallback, useRef, useState } from 'react'

export type IVisualState = {
  hovered?: boolean
  focused?: boolean
  pressed?: boolean
  dragged?: boolean
  strategy?: 'accumulate' | 'override' | 'replace'
}

export type IUseVisualStateResult = {
  visualState: IVisualState
  setRef: Ref<Element>
}

export type IVisualStateOptions = {
  retainFocusAfterClick?: boolean
  disabled?: boolean
}

// Used to handle overlapping surfaces.
let activeTarget: EventTarget | null = null

export const useVisualState = (visualState?: IVisualState, options?: IVisualStateOptions): IUseVisualStateResult => {
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [pressed, setPressed] = useState(false)
  const focusFromRef = useRef<'mouse'>(null)

  const handleMouseEnter = useCallback(() => setHovered(true), [])

  const handleMouseLeave = useCallback(() => {
    setHovered(false)
    setPressed(false)
    activeTarget = null
  }, [])

  const handleFocus = useCallback(() => {
    setFocused(options?.retainFocusAfterClick ? true : focusFromRef.current !== 'mouse')
  }, [options?.retainFocusAfterClick])

  const handleBlur = useCallback(() => {
    focusFromRef.current = null
    setFocused(false)
  }, [])

  const handleMouseDown = useCallback((event: MouseEvent | Event) => {
    focusFromRef.current = 'mouse'
    const pressed = !activeTarget && (event as MouseEvent).button === 0
    setPressed(pressed)
    activeTarget = event.target
  }, [])

  const handleMouseUp = useCallback(() => {
    setHovered(false)
    setPressed(false)
    activeTarget = null
  }, [])

  const handleKeyDown = useCallback((event: KeyboardEvent | Event) => {
    const pressed = !activeTarget && (event as KeyboardEvent).key === ' '
    setPressed(pressed)
    activeTarget = event.target
  }, [])

  const handleKeyUp = useCallback(() => {
    setPressed(false)
    activeTarget = null
  }, [])

  const setRef = useCallback(
    (element: Element | null) => {
      if (element && !options?.disabled && visualState?.strategy !== 'replace') {
        const controller = new AbortController()
        const signal = { signal: controller.signal }
        element.addEventListener('mouseenter', handleMouseEnter, signal)
        element.addEventListener('mouseleave', handleMouseLeave, signal)
        element.addEventListener('mousedown', handleMouseDown, signal)
        element.addEventListener('mouseup', handleMouseUp, signal)
        element.addEventListener('focus', handleFocus, signal)
        element.addEventListener('blur', handleBlur, signal)
        element.addEventListener('keydown', handleKeyDown, signal)
        element.addEventListener('keyup', handleKeyUp, signal)
        return () => {
          controller.abort()
        }
      }
    },
    [
      options?.disabled,
      visualState?.strategy,
      handleMouseEnter,
      handleMouseLeave,
      handleFocus,
      handleBlur,
      handleMouseDown,
      handleMouseUp,
      handleKeyDown,
      handleKeyUp,
    ],
  )

  const newVisualState = visualState || { pressed, focused, hovered, dragged: false }

  if (newVisualState.dragged) {
    return {
      visualState: {
        ...newVisualState,
        hovered: false,
        pressed: false,
      },
      setRef,
    }
  }

  const result = {
    visualState: {
      ...newVisualState,
      hovered: newVisualState.hovered && !newVisualState.pressed,
      focused: newVisualState.focused
        ? options?.retainFocusAfterClick
          ? newVisualState.focused
          : focusFromRef.current !== 'mouse'
        : false,
    },
    setRef,
  }

  return result
}
