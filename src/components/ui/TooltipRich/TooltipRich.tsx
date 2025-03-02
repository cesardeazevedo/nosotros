import { FloatingDelayGroup } from '@floating-ui/react'
import React, { memo } from 'react'
import { css, html } from 'react-strict-dom'
import type { ElevationLevel } from '../Elevation/Elevation'
import { PopoverBase } from '../Popover/PopoverBase'
import type {
  IPopoverBaseContentRendererProps,
  IPopoverBaseProps,
  IRendererPropsWithForwardedProps,
} from '../Popover/PopoverBase.types'
import { PopoverHoverRender } from '../Popover/PopoverHoverRender'
import { tooltipTokens } from '../Tooltip/Tooltip.stylex'

type Props = Omit<IPopoverBaseProps, 'children' | 'contentRenderer'> & {
  content: (props: IRendererPropsWithForwardedProps<IPopoverBaseContentRendererProps, object>) => React.ReactNode
  enterDelay?: number
  persistent?: boolean
  keepMounted?: boolean
  elevation?: ElevationLevel
  children: React.ReactNode
}

export const TooltipRich = memo(function TooltipRich(props: Props) {
  const {
    persistent = false,
    enterDelay = 700,
    placement = 'bottom',
    children,
    content,
    cursor,
    keepMounted,
    ...other
  } = props
  return (
    <PopoverHoverRender content={children}>
      <FloatingDelayGroup delay={enterDelay} timeoutMs={0}>
        <PopoverBase
          {...other}
          placement={placement}
          role='tooltip'
          contentRenderer={(props) => {
            return (
              <>
                {props.renderCursor({ ...css.props(styles.cursor) })}
                {content(props)}
              </>
            )
          }}
          cursor={cursor}
          forwardProps
          openEvents={{
            click: !!persistent,
            hover: !persistent,
            focus: !persistent,
            ...other.openEvents,
          }}
          closeEvents={{
            clickOutside: !persistent,
            focusOut: !persistent,
            escapeKey: false,
          }}>
          {(renderProps) => (
            <html.span {...renderProps.getProps()} ref={renderProps.setRef}>
              {children}
            </html.span>
          )}
        </PopoverBase>
      </FloatingDelayGroup>
    </PopoverHoverRender>
  )
})

const styles = css.create({
  content: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: 'max-content',
  },
  cursor: {
    fill: tooltipTokens.containerColor,
  },
})
