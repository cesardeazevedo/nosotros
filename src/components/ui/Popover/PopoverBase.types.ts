import type {
  ElementProps,
  FlipOptions,
  FloatingFocusManagerProps,
  Middleware,
  Placement,
  ReferenceType,
  ShiftOptions,
  SizeOptions,
  Strategy,
  UseRoleProps,
} from '@floating-ui/react'

import type {
  IFloatingTransitionOrigin,
  IFloatingTransitionPattern,
  Props as IFloatingTransitionProps,
  IOrientation,
} from '../FloatingTransition/FloatingTransition'
import type { IPopoverCursorType } from '../hooks/usePopoverCursor'
import type { Props as IScrimProps } from '../Scrim/Scrim'
import type { SxProps } from '../types'
import type { IPortalProps } from './Portal'

export type IRendererPropsWithForwardedProps<TRenderProps, TForwardedProps> = TRenderProps & {
  forwardedProps?: TForwardedProps
}

export type IRendererWithForwardedProps<TRenderProps = object, TForwardedProps = Record<string, unknown>> =
  | React.ReactNode
  | ((props: IRendererPropsWithForwardedProps<TRenderProps, TForwardedProps>) => React.ReactNode)

export type IForwardableProps = {
  forwardProps?: boolean
}

export type IPopoverBaseContentRendererProps = {
  placement: Placement
  close: (event?: React.MouseEvent) => void
  renderCursor: (userProps?: React.HTMLAttributes<SVGSVGElement>) => React.ReactNode
}

export type IPopoverBaseTriggerRendererProps = {
  opened: boolean
  placement: Placement
  open: () => void
  close: () => void

  /**
   * A callback to set the trigger element.
   */
  setRef: ((node: ReferenceType | null) => void) | null

  /**
   * A function that returns the props to apply to the trigger element.
   */
  getProps: () => Record<string, unknown>
}

export type IPopoverOpenEvent = 'hover' | 'focus' | 'click' | 'touch'
export type IPopoverOpenEvents = Partial<Record<IPopoverOpenEvent, boolean>>

export type IPopoverCloseEvent = 'clickOutside' | 'focusOut' | 'escapeKey'
export type IPopoverCloseEvents = Partial<Record<IPopoverCloseEvent, boolean>>

export type IPopoverMiddlewares = {
  shift?: boolean | ShiftOptions
  flip?: boolean | FlipOptions
  size?: boolean | SizeOptions
}

export type IPopoverBaseProps<TForwardedProps extends object = object> = Pick<IPortalProps, 'root'> &
  IForwardableProps & {
    sx?: SxProps
    contentRenderer: IRendererWithForwardedProps<IPopoverBaseContentRendererProps, TForwardedProps>
    children?: ((props: IPopoverBaseTriggerRendererProps) => React.ReactNode) | React.ReactNode
    placement?: Placement
    transitionOrientation?: IOrientation
    transitionOrigin?: IFloatingTransitionOrigin
    transitionPattern?: IFloatingTransitionPattern
    opened?: boolean
    defaultOpened?: boolean
    cursor?: IPopoverCursorType
    onOpen?: () => void
    onClose?: () => void
    disabled?: boolean
    role?: UseRoleProps['role']
    trapFocus?: boolean
    preventAutoFocus?: boolean
    matchTargetWidth?: boolean
    withScrim?: boolean
    clientPoint?: { x?: number; y?: number }
    slotProps?: {
      floatingFocusManager?: Partial<FloatingFocusManagerProps>
      floatingTransition?: Partial<IFloatingTransitionProps> // & { ref?: MutableRefObject<HTMLDivElement | undefined> }
      scrim?: Partial<IScrimProps> & { ref?: React.LegacyRef<HTMLDivElement> }
    }
    floatingStrategy?: Strategy | false
    middlewares?: IPopoverMiddlewares
    additionalMiddlewares?: Array<Middleware | null | undefined | false>

    additionalInteractions?: Array<ElementProps>
    openEvents?: IPopoverOpenEvents
    closeEvents?: IPopoverCloseEvents
  }
