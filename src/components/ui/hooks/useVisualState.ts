import type { Ref } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

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

export const useVisualState = (visualState?: IVisualState, options?: IVisualStateOptions): IUseVisualStateResult => {
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [pressed, setPressed] = useState(false)
  const focusFromRef = useRef<'mouse'>(undefined)

  const handleMouseEnter = useCallback(() => {
    setHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHovered(false)
    setPressed(false)
  }, [])

  const handleFocus = useCallback(() => {
    setFocused(options?.retainFocusAfterClick ? true : focusFromRef.current !== 'mouse')
  }, [options?.retainFocusAfterClick])

  const handleBlur = useCallback(() => {
    focusFromRef.current = undefined
    setFocused(false)
  }, [])

  const handleMouseDown = useCallback((event: MouseEvent | Event) => {
    focusFromRef.current = 'mouse'
    const pressed = (event as MouseEvent).button === 0
    setPressed(pressed)
  }, [])

  const handleMouseUp = useCallback(() => {
    setPressed(false)
  }, [])

  const handleKeyDown = useCallback((event: KeyboardEvent | Event) => {
    const pressed = (event as KeyboardEvent).key === ' '
    setPressed(pressed)
  }, [])

  const handleKeyUp = useCallback(() => {
    setPressed(false)
  }, [])

  const elementRef = useRef<Element | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element || options?.disabled || visualState?.strategy === 'replace') return
    const controller = new AbortController()
    const signal = { signal: controller.signal }
    element.addEventListener('pointerenter', handleMouseEnter, signal)
    element.addEventListener('pointerleave', handleMouseLeave, signal)
    element.addEventListener('pointerdown', handleMouseDown, signal)
    element.addEventListener('pointerup', handleMouseUp, signal)
    element.addEventListener('focus', handleFocus, signal)
    element.addEventListener('blur', handleBlur, signal)
    element.addEventListener('keydown', handleKeyDown, signal)
    element.addEventListener('keyup', handleKeyUp, signal)

    return () => {
      controller.abort()
    }
  }, [])

  const newVisualState = visualState || { pressed, focused, hovered, dragged: false }

  if (newVisualState.dragged) {
    return {
      visualState: {
        ...newVisualState,
        hovered: false,
        pressed: false,
      },
      setRef: elementRef,
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
    setRef: elementRef,
  }

  return result
}
