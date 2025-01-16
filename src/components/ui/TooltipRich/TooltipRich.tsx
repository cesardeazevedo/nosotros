import { FloatingDelayGroup } from '@floating-ui/react'
import React, { memo } from 'react'
import { css, html } from 'react-strict-dom'
import type { ElevationLevel } from '../Elevation/Elevation'
import { PopoverBase } from '../Popover/PopoverBase'
import type { IPopoverBaseProps, IPopoverBaseTriggerRendererProps } from '../Popover/PopoverBase.types'
import { tooltipTokens } from '../Tooltip/Tooltip.stylex'

type Props = Omit<IPopoverBaseProps, 'children' | 'contentRenderer'> & {
  content: () => React.ReactNode
  enterDelay?: number
  persistent?: boolean
  elevation?: ElevationLevel
  children:
    | ((props: Omit<IPopoverBaseTriggerRendererProps, 'setRef' | 'getProps'>) => React.ReactNode)
    | React.ReactNode
}

export const TooltipRich = memo(function TooltipRich(props: Props) {
  const { persistent = false, enterDelay = 700, placement = 'bottom', children, content, cursor, ...other } = props
  return (
    <FloatingDelayGroup delay={enterDelay}>
      <PopoverBase
        {...other}
        placement={placement}
        role='tooltip'
        contentRenderer={({ renderCursor }) => {
          return (
            <>
              {renderCursor({ ...css.props(styles.cursor) })}
              {content()}
            </>
          )
        }}
        cursor={cursor}
        forwardProps
        openEvents={{
          click: !!persistent,
          hover: !persistent,
          focus: !persistent,
        }}
        closeEvents={{
          clickOutside: !persistent,
          focusOut: !persistent,
          escapeKey: false,
        }}>
        {(renderProps) => (
          <html.span {...renderProps.getProps()} ref={renderProps.setRef}>
            {typeof children === 'function' ? children(renderProps) : children}
          </html.span>
        )}
      </PopoverBase>
    </FloatingDelayGroup>
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
