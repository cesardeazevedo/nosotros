import { duration } from '@/themes/duration.stylex'
import { easing } from '@/themes/easing.stylex'
import type { Placement } from '@floating-ui/react'
import React, { cloneElement, isValidElement, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { css } from 'react-strict-dom'
import { tooltipTokens } from './Tooltip.stylex'

type Props = {
  text: React.ReactNode
  enterDelay?: number
  keepMounted?: boolean
  opened?: boolean
  placement?: Placement
  cursor?: 'arrow' | 'dot'
  children: React.ReactNode
}

type TooltipPosition = {
  top: number
  left: number
}

const GAP = 8
const ARROW_SIZE = 8
const VIEWPORT_PADDING = 8
const CLOSE_ANIMATION_MS = 150

const getMainPlacement = (placement: Placement) => placement.split('-')[0] as 'top' | 'bottom' | 'left' | 'right'
const getAlignPlacement = (placement: Placement) => (placement.split('-')[1] as 'start' | 'end' | undefined) || 'center'
const getFlippedPlacement = (placement: Placement): Placement => {
  const main = getMainPlacement(placement)
  const align = getAlignPlacement(placement)
  const nextMain = main === 'top' ? 'bottom' : main === 'bottom' ? 'top' : main === 'left' ? 'right' : 'left'
  return (align === 'center' ? nextMain : `${nextMain}-${align}`) as Placement
}
const getTransformOrigin = (placement: Placement) => {
  const main = getMainPlacement(placement)
  if (main === 'bottom') return 'top center'
  if (main === 'top') return 'bottom center'
  if (main === 'right') return 'center left'
  return 'center right'
}

const getCursorStyle = (placement: Placement): React.CSSProperties => {
  const base: React.CSSProperties = {}
  const main = getMainPlacement(placement)
  if (main === 'top') {
    base.bottom = -4
    base.left = '50%'
    base.marginLeft = -4
    return base
  }
  if (main === 'bottom') {
    base.top = -4
    base.left = '50%'
    base.marginLeft = -4
    return base
  }
  if (main === 'left') {
    base.right = -4
    base.top = '50%'
    base.marginTop = -4
    return base
  }
  base.left = -4
  base.top = '50%'
  base.marginTop = -4
  return base
}

const getPosition = (rect: DOMRect, tipWidth: number, tipHeight: number, placement: Placement): TooltipPosition => {
  const align = getAlignPlacement(placement)
  switch (placement) {
    case 'top':
    case 'top-start':
    case 'top-end': {
      const left =
        align === 'start'
          ? rect.left
          : align === 'end'
            ? rect.right - tipWidth
            : rect.left + rect.width / 2
      return { top: rect.top - GAP - tipHeight, left: align === 'center' ? left - tipWidth / 2 : left }
    }
    case 'left':
    case 'left-start':
    case 'left-end': {
      const top =
        align === 'start'
          ? rect.top
          : align === 'end'
            ? rect.bottom - tipHeight
            : rect.top + rect.height / 2
      return { top: align === 'center' ? top - tipHeight / 2 : top, left: rect.left - GAP - tipWidth }
    }
    case 'right':
    case 'right-start':
    case 'right-end': {
      const top =
        align === 'start'
          ? rect.top
          : align === 'end'
            ? rect.bottom - tipHeight
            : rect.top + rect.height / 2
      return { top: align === 'center' ? top - tipHeight / 2 : top, left: rect.right + GAP }
    }
    case 'bottom':
    case 'bottom-start':
    case 'bottom-end':
    default: {
      const left =
        align === 'start'
          ? rect.left
          : align === 'end'
            ? rect.right - tipWidth
            : rect.left + rect.width / 2
      return { top: rect.bottom + GAP, left: align === 'center' ? left - tipWidth / 2 : left }
    }
  }
}

export const Tooltip = function Tooltip(props: Props) {
  const { children, text, enterDelay = 700, keepMounted, opened: openedProp, placement = 'bottom', cursor = 'arrow' } = props
  const id = useId()
  const triggerRef = useRef<HTMLSpanElement | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [opened, setOpened] = useState(false)
  const [closing, setClosing] = useState(false)
  const [position, setPosition] = useState<TooltipPosition | null>(null)
  const [resolvedPlacement, setResolvedPlacement] = useState<Placement>(placement)

  const isControlled = openedProp !== undefined
  const isOpen = openedProp ?? opened

  const refreshPosition = useCallback(() => {
    const trigger = triggerRef.current
    const popover = popoverRef.current
    if (!trigger || !popover) return

    const triggerRect = trigger.getBoundingClientRect()
    const tooltipRect = popover.getBoundingClientRect()
    const tipWidth = tooltipRect.width || popover.offsetWidth
    const tipHeight = tooltipRect.height || popover.offsetHeight
    if (!tipWidth || !tipHeight) return

    let finalPlacement = placement
    let next = getPosition(triggerRect, tipWidth, tipHeight, finalPlacement)
    const main = getMainPlacement(finalPlacement)

    const overflowsMainAxis =
      main === 'top'
        ? next.top < VIEWPORT_PADDING
        : main === 'bottom'
          ? next.top + tipHeight > window.innerHeight - VIEWPORT_PADDING
          : main === 'left'
            ? next.left < VIEWPORT_PADDING
            : next.left + tipWidth > window.innerWidth - VIEWPORT_PADDING

    if (overflowsMainAxis) {
      finalPlacement = getFlippedPlacement(finalPlacement)
      next = getPosition(triggerRect, tipWidth, tipHeight, finalPlacement)
    }

    const clampedLeft = Math.min(
      Math.max(next.left, VIEWPORT_PADDING),
      window.innerWidth - tipWidth - VIEWPORT_PADDING,
    )
    const clampedTop = Math.min(
      Math.max(next.top, VIEWPORT_PADDING),
      window.innerHeight - tipHeight - VIEWPORT_PADDING,
    )

    setResolvedPlacement(finalPlacement)
    setPosition({ top: clampedTop, left: clampedLeft })
  }, [placement])

  const open = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setClosing(false)
    setPosition(null)
    setResolvedPlacement(placement)
    if (!isControlled) {
      setOpened(true)
    }
  }, [isControlled, placement])

  const close = useCallback(() => {
    const popover = popoverRef.current
    if (!popover || !popover.matches(':popover-open')) {
      setOpened(false)
      setClosing(false)
      return
    }
    if (!isControlled) {
      setOpened(false)
    }
    setClosing(true)
    closeTimerRef.current = setTimeout(() => {
      if (popover.matches(':popover-open')) {
        popover.hidePopover()
      }
      setClosing(false)
    }, CLOSE_ANIMATION_MS)
  }, [isControlled])

  const scheduleOpen = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current)
    }
    openTimerRef.current = setTimeout(open, enterDelay)
  }, [enterDelay, open])

  const handleLeave = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }
    if (!keepMounted) {
      close()
    }
  }, [close, keepMounted])

  useEffect(() => {
    return () => {
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current)
      }
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const popover = popoverRef.current
    if (!popover) return
    if (!popover.matches(':popover-open')) {
      popover.showPopover()
    }
    // Wait one frame so popover has final dimensions before measuring.
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      refreshPosition()
      raf2 = requestAnimationFrame(refreshPosition)
    })

    const onWindowUpdate = () => refreshPosition()
    window.addEventListener('resize', onWindowUpdate)
    window.addEventListener('scroll', onWindowUpdate, true)
    return () => {
      cancelAnimationFrame(raf1)
      if (raf2) {
        cancelAnimationFrame(raf2)
      }
      window.removeEventListener('resize', onWindowUpdate)
      window.removeEventListener('scroll', onWindowUpdate, true)
    }
  }, [isOpen, refreshPosition])

  const inlineStyle = useMemo<React.CSSProperties>(() => {
    if (!position) {
      return { visibility: 'hidden' }
    }
    return {
      top: `${position.top}px`,
      left: `${position.left}px`,
      transformOrigin: getTransformOrigin(resolvedPlacement),
    }
  }, [position, resolvedPlacement])

  const cursorStyle = useMemo(() => getCursorStyle(resolvedPlacement), [resolvedPlacement])
  const visible = isOpen && !!position

  const setTriggerRef = useCallback((node: HTMLSpanElement | null) => {
    triggerRef.current = node
  }, [])

  const triggerProps = {
    'aria-describedby': isOpen ? id : undefined,
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      setTriggerRef(e.currentTarget as unknown as HTMLSpanElement)
      scheduleOpen()
    },
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      setTriggerRef(e.currentTarget as unknown as HTMLSpanElement)
      scheduleOpen()
    },
    onMouseLeave: handleLeave,
    onBlur: handleLeave,
  } as const

  const trigger = useMemo(() => {
    if (!isValidElement(children)) {
      return (
        <span ref={setTriggerRef} {...triggerProps}>
          {children}
        </span>
      )
    }

    const child = children as React.ReactElement<{
      onMouseEnter?: React.MouseEventHandler
      onMouseLeave?: React.MouseEventHandler
      onFocus?: React.FocusEventHandler
      onBlur?: React.FocusEventHandler
      ref?: React.Ref<HTMLElement>
      'aria-describedby'?: string
    }>

    const mergedProps = {
      ...triggerProps,
      onMouseEnter: (e: React.MouseEvent) => {
        child.props.onMouseEnter?.(e)
        scheduleOpen()
      },
      onMouseLeave: (e: React.MouseEvent) => {
        child.props.onMouseLeave?.(e)
        handleLeave()
      },
      onFocus: (e: React.FocusEvent) => {
        child.props.onFocus?.(e)
        scheduleOpen()
      },
      onBlur: (e: React.FocusEvent) => {
        child.props.onBlur?.(e)
        handleLeave()
      },
      ref: (node: HTMLElement | null) => {
        setTriggerRef(node as HTMLSpanElement | null)
      },
    }

    return cloneElement(child, mergedProps)
  }, [children, handleLeave, id, isOpen, scheduleOpen, setTriggerRef])

  return (
    <>
      {trigger}

      {(keepMounted || isOpen || closing) && (
        <div
          id={id}
          ref={popoverRef}
          role='tooltip'
          popover='manual'
          onMouseLeave={handleLeave}
          style={{ ...inlineStyle }}
          className={css.props(styles.content, visible && styles.content$open, closing && styles.content$close).className}>
          {cursor === 'arrow' && (
            <span
              className={css.props(styles.cursor).className}
              style={cursorStyle}
              aria-hidden
            />
          )}
          <span className={css.props(styles.text).className}>{text}</span>
        </div>
      )}
    </>
  )
}

const styles = css.create({
  content: {
    position: 'fixed',
    inset: 'auto',
    margin: 0,
    overflow: 'visible',
    border: 'none',
    zIndex: 10000,
    borderRadius: tooltipTokens.containerShape,
    backgroundColor: tooltipTokens.containerColor,
    paddingTop: tooltipTokens.topSpace,
    paddingBottom: tooltipTokens.bottomSpace,
    paddingLeft: tooltipTokens.leadingSpace,
    paddingRight: tooltipTokens.trailingSpace,
    maxWidth: tooltipTokens.containerMaxWidth,
    minHeight: tooltipTokens.containerMinHeight,
    pointerEvents: 'none',
    opacity: 0,
    transform: 'scaleY(0.75)',
    transitionProperty: 'opacity, transform',
    transitionDuration: duration.short4,
    transitionTimingFunction: easing.emphasizedDecelerate,
  },
  content$open: {
    opacity: 1,
    transform: 'translateY(0) scale(1)',
  },
  content$close: {
    transitionDuration: duration.short3,
    transitionTimingFunction: easing.emphasizedAccelerate,
  },
  text: {
    color: tooltipTokens.supportingTextColor,
    fontFamily: tooltipTokens.supportingTextFont,
    fontSize: tooltipTokens.supportingTextSize,
    fontWeight: tooltipTokens.supportingTextWeight,
    lineHeight: tooltipTokens.supportingTextLineHeight,
    letterSpacing: tooltipTokens.supportingTextLetterSpacing,
    whiteSpace: 'pre-wrap',
  },
  cursor: {
    fill: tooltipTokens.containerColor,
    position: 'absolute',
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    backgroundColor: tooltipTokens.containerColor,
    transform: 'rotate(45deg)',
    borderRadius: 1,
  },
})
