import {
  arrow,
  autoUpdate,
  flip,
  FloatingArrow,
  FloatingFocusManager,
  offset,
  safePolygon,
  shift,
  size,
  useClick,
  useClientPoint,
  useDelayGroup,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useMergeRefs,
  useRole,
  useTransitionStatus,
} from '@floating-ui/react'
import { forwardRef, useRef } from 'react'

import { css, html } from 'react-strict-dom'
import { FloatingTransition } from '../FloatingTransition/FloatingTransition'
import { useControlledValue } from '../hooks/useControlledValue'
import { usePopoverCursor } from '../hooks/usePopoverCursor'
import { Scrim } from '../Scrim/Scrim'
import type {
  IPopoverBaseProps,
  IPopoverCloseEvents,
  IPopoverMiddlewares,
  IPopoverOpenEvents,
} from './PopoverBase.types'
import { Portal } from './Portal'

const isObject = (value: unknown): value is object =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const defaultOpenEvents: IPopoverOpenEvents = {
  hover: false,
  focus: false,
  click: false,
  touch: false,
}

const defaultCloseEvents: IPopoverCloseEvents = {
  clickOutside: true,
  focusOut: true,
  escapeKey: true,
}

const defaultMiddlewares: IPopoverMiddlewares = {
  shift: true,
  flip: true,
  size: true,
}

function PreventAutoFocus() {
  // This is a hack to prevent the first focusable element from being focused
  // when the side sheet is opened.
  return <button type='button' {...css.props(styles.outOfScreen)} />
}

export const PopoverBase = forwardRef<HTMLDivElement, IPopoverBaseProps>(function PopoverBase(props, forwardedRef) {
  const {
    sx,
    root,
    contentRenderer,
    children,
    placement = 'top',
    transitionOrientation,
    transitionOrigin: transitionOriginProp,
    opened: openedProp,
    defaultOpened,
    cursor: cursorType = false,
    onOpen,
    onClose,
    forwardProps,
    disabled,
    role: roleProp,
    trapFocus,
    matchTargetWidth,
    withScrim,
    slotProps,
    preventAutoFocus = true,
    clientPoint: clientPointProp,
    middlewares: middlewaresProp,
    additionalMiddlewares,
    additionalInteractions,
    floatingStrategy = 'absolute',
    openEvents: openEventsProp,
    closeEvents: closeEventsProp,
    ...other
  } = props

  const openEvents = {
    ...defaultOpenEvents,
    ...openEventsProp,
  }

  const closeEvents = {
    ...defaultCloseEvents,
    ...closeEventsProp,
  }

  const middlewares = {
    ...defaultMiddlewares,
    ...middlewaresProp,
  }
  const transitionOrigin = transitionOriginProp ?? (cursorType ? 'cursor' : 'corner')

  const [opened, setOpened] = useControlledValue({
    controlled: openedProp,
    default: defaultOpened || false,
    name: 'PopoverBase',
    onValueChange: (newOpened) => {
      if (newOpened !== opened) {
        if (newOpened) {
          onOpen?.()
        } else {
          onClose?.()
        }
      }
    },
  })

  const arrowRef = useRef(null)
  const cursor = usePopoverCursor({ type: cursorType })

  const floating = useFloating({
    placement,
    open: opened,
    onOpenChange: setOpened,
    whileElementsMounted: autoUpdate,
    strategy: floatingStrategy || 'absolute',
    middleware: [
      offset(cursorType ? 4 + cursor.size.height : undefined),
      middlewares.flip &&
        flip({
          crossAxis: placement.includes('-'),
          fallbackAxisSideDirection: 'start',
          padding: 5,
          ...(isObject(middlewares.flip) ? middlewares.flip : undefined),
        }),
      middlewares.shift &&
        shift({
          padding: 8,
          ...(isObject(middlewares.shift) ? middlewares.shift : undefined),
        }),
      !!cursorType &&
        arrow({
          element: arrowRef,
        }),
      middlewares.size &&
        size({
          apply: matchTargetWidth
            ? ({ rects, elements }) => {
                Object.assign(elements.floating.style, {
                  width: `${rects.reference.width}px`,
                })
              }
            : undefined,
          ...(isObject(middlewares.size) ? middlewares.size : undefined),
        }),
      ...(additionalMiddlewares ?? []),
    ],
  })

  const delayGroup = useDelayGroup(floating.context, {
    id: openEvents.hover ? undefined : '__persistent',
  })

  const hover = useHover(floating.context, {
    enabled: !!children && !!openEvents.hover && !disabled,
    move: false,
    delay: delayGroup.delay,
    mouseOnly: !openEvents.touch,
    handleClose: safePolygon(),
  })

  const click = useClick(floating.context, {
    enabled: !!children && !!openEvents.click && !disabled,
  })

  const focus = useFocus(floating.context, {
    enabled: !!children && !!openEvents.focus && !disabled,
    visibleOnly: true,
  })

  const dismiss = useDismiss(floating.context, {
    outsidePress: !!closeEvents.clickOutside,
    escapeKey: closeEvents.escapeKey,
  })

  const clientPoint = useClientPoint(floating.context, {
    enabled: !!clientPointProp,
    x: clientPointProp?.x,
    y: clientPointProp?.y,
  })

  const role = useRole(floating.context, { role: roleProp })
  const interactions = useInteractions([
    hover,
    focus,
    click,
    dismiss,
    role,
    clientPoint,
    ...(additionalInteractions ?? []),
  ])
  const transitionStatus = useTransitionStatus(floating.context, {
    duration: {
      open: 200,
      close: 200,
    },
  })

  const renderCursor = (userProps?: React.HTMLAttributes<SVGSVGElement>): React.ReactNode => (
    <FloatingArrow
      {...userProps}
      ref={arrowRef}
      context={floating.context}
      width={cursor.size.width}
      height={cursor.size.height}
      d={cursor.svgPath}
    />
  )

  const triggerElement =
    typeof children === 'function'
      ? children({
          opened,
          placement: floating.placement,
          getProps: interactions.getReferenceProps,
          setRef: floating.refs.setReference,
          open: () => setOpened(true),
          close: () => setOpened(false),
        })
      : children

  const floatingHandleRef = useMergeRefs([floating.refs.setFloating, forwardedRef])

  return (
    <>
      {triggerElement}
      {transitionStatus.isMounted ? (
        <Portal root={root}>
          <FloatingFocusManager
            modal={false}
            disabled={!trapFocus}
            context={floating.context}
            closeOnFocusOut={closeEvents.focusOut}
            {...slotProps?.floatingFocusManager}>
            <html.div style={sx}>
              {withScrim ? <Scrim floatingContext={floating.context} lockScroll {...slotProps?.scrim} /> : null}
              <div
                {...css.props([
                  styles.floating,
                  floatingStrategy && styles[`floating$${floatingStrategy}`],
                  floatingStrategy && styles.position(floating.x, floating.y),
                ])}
                ref={floatingHandleRef}
                {...interactions.getFloatingProps()}>
                <FloatingTransition
                  placement={floating.placement}
                  status={transitionStatus.status}
                  origin={transitionOrigin}
                  cursorTransformOrigin={cursor.getTransformOrigin(floating)}
                  orientation={transitionOrientation}
                  pattern={floatingStrategy ? 'enterExit' : 'enterExitOffScreen'}
                  {...slotProps?.floatingTransition}>
                  {preventAutoFocus ? <PreventAutoFocus /> : null}
                  {typeof contentRenderer === 'function' ? (
                    contentRenderer({
                      placement: floating.placement,
                      close: () => setOpened(false),
                      forwardedProps: forwardProps ? other : undefined,
                      renderCursor,
                    })
                  ) : (
                    <>
                      {renderCursor()}
                      {contentRenderer}
                    </>
                  )}
                </FloatingTransition>
              </div>
            </html.div>
          </FloatingFocusManager>
        </Portal>
      ) : null}
    </>
  )
})

const styles = css.create({
  position: (x: number, y: number) => ({
    left: x,
    top: y,
  }),
  floating: {
    // width: '100%',
    // height: '100%',
    width: 'inherit',
    height: 'inherit',
    zIndex: 300,
    opacity: '1',
  },
  floating$absolute: {
    position: 'absolute',
  },
  floating$fixed: {
    position: 'fixed',
  },
  outOfScreen: {
    position: 'absolute',
    left: '-9999px',
  },
})
