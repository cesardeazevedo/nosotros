import type { Placement, UseFloatingReturn } from '@floating-ui/react'
import { useCallback } from 'react'

type IPosition = {
  x: number
  y: number
}

type ISize<TSize = number> = {
  width: TSize
  height: TSize
}

const POPOVER_CURSOR_ARROW_WIDTH = 14
const POPOVER_CURSOR_ARROW_HEIGHT = 7
const POPOVER_CURSOR_ARROW_SVG_PATH = undefined

const POPOVER_CURSOR_DOT_WIDTH = 11
const POPOVER_CURSOR_DOT_HEIGHT = 11
const POPOVER_CURSOR_DOT_SVG_PATH = 'M 5.5,0 A 3,3 0 1,0 5.5,6 A 3,3 0 1,0 5.5,0'

export type IPopoverCursorType = 'arrow' | 'dot' | false

export type IUsePopoverCursorProps = {
  type: IPopoverCursorType
}

export type IPopoverCursor = {
  position: IPosition
  size: ISize
}

export type IUsePopoverCursorResult = {
  size: ISize
  svgPath?: string
  getTransformOrigin: (floating: UseFloatingReturn) => string | undefined
}

const getCursorTipTransformOrigin = (placement: Placement, cursor: IPopoverCursor): string => {
  switch (placement) {
    case 'bottom':
    case 'bottom-start':
    case 'bottom-end':
      return `${cursor.position.x}px ${-cursor.size.height}px`

    case 'left':
    case 'left-start':
    case 'left-end':
      return `calc(100% + ${cursor.size.height}px) ${cursor.position.y}px`

    case 'right':
    case 'right-start':
    case 'right-end':
      return `${-cursor.size.height}px ${cursor.position.y}px`

    case 'top':
    case 'top-start':
    case 'top-end':
    default:
      return `${cursor.position.x}px calc(100% + ${cursor.size.height}px)`
  }
}

type ICursorProps = {
  size: ISize
  svgPath?: string
}

const getCursorProps = (type: IPopoverCursorType): ICursorProps => {
  switch (type) {
    case 'arrow':
      return {
        size: {
          width: POPOVER_CURSOR_ARROW_WIDTH,
          height: POPOVER_CURSOR_ARROW_HEIGHT,
        },
        svgPath: POPOVER_CURSOR_ARROW_SVG_PATH,
      }

    case 'dot':
      return {
        size: {
          width: POPOVER_CURSOR_DOT_WIDTH,
          height: POPOVER_CURSOR_DOT_HEIGHT,
        },
        svgPath: POPOVER_CURSOR_DOT_SVG_PATH,
      }

    default:
      return {
        size: {
          width: 0,
          height: 0,
        },
        svgPath: undefined,
      }
  }
}

export const usePopoverCursor = (props: IUsePopoverCursorProps): IUsePopoverCursorResult => {
  const { type } = props
  const cursorProps = getCursorProps(type)

  const getTransformOrigin = useCallback(
    (floating: UseFloatingReturn): string => {
      const cursor: IPopoverCursor = {
        size: cursorProps.size,
        position: {
          x: floating.middlewareData.arrow?.x ?? 0 + cursorProps.size.width / 2,
          y: floating.middlewareData.arrow?.y ?? 0 + cursorProps.size.height,
        },
      }
      const transformOrigin = getCursorTipTransformOrigin(floating.placement, cursor)

      return transformOrigin
    },
    [cursorProps],
  )

  return {
    size: cursorProps.size,
    svgPath: cursorProps.svgPath,
    getTransformOrigin,
  }
}
