import { FloatingDelayGroup } from '@floating-ui/react'
import React from 'react'
import { css, html } from 'react-strict-dom'
import { PopoverBase } from '../Popover/PopoverBase'
import type { IPopoverBaseProps, IPopoverBaseTriggerRendererProps } from '../Popover/PopoverBase.types'
import { tooltipTokens } from './Tooltip.stylex'

export type Props = Omit<IPopoverBaseProps, 'children' | 'contentRenderer'> & {
  text: React.ReactNode
  enterDelay?: number
  children:
    | ((props: Omit<IPopoverBaseTriggerRendererProps, 'setRef' | 'getProps'>) => React.ReactNode)
    | React.ReactNode
}

export const Tooltip = function Tooltip(props: Props) {
  const { enterDelay = 700, placement = 'bottom', children, text, ...other } = props
  return (
    <FloatingDelayGroup delay={enterDelay}>
      <PopoverBase
        cursor='arrow'
        {...other}
        placement={placement}
        role='tooltip'
        contentRenderer={({ renderCursor }) => {
          return (
            <html.div style={styles.content}>
              {renderCursor({ ...css.props(styles.cursor) })}
              <html.span style={styles.text}>{text}</html.span>
            </html.div>
          )
        }}
        forwardProps
        openEvents={{ hover: true, focus: true }}>
        {(renderProps) => (
          <html.div {...renderProps.getProps()} ref={renderProps.setRef}>
            {typeof children === 'function' ? children(renderProps) : children}
          </html.div>
        )}
      </PopoverBase>
    </FloatingDelayGroup>
  )
}

const styles = css.create({
  content: {
    borderRadius: tooltipTokens.containerShape,
    backgroundColor: tooltipTokens.containerColor,
    paddingTop: tooltipTokens.topSpace,
    paddingBottom: tooltipTokens.bottomSpace,
    paddingLeft: tooltipTokens.leadingSpace,
    paddingRight: tooltipTokens.trailingSpace,
    maxWidth: tooltipTokens.containerMaxWidth,
    minHeight: tooltipTokens.containerMinHeight,
  },
  text: {
    color: tooltipTokens.supportingTextColor,
    fontFamily: tooltipTokens.supportingTextFont,
    fontSize: tooltipTokens.supportingTextSize,
    fontWeight: tooltipTokens.supportingTextWeight,
    lineHeight: tooltipTokens.supportingTextLineHeight,
    letterSpacing: tooltipTokens.supportingTextLetterSpacing,
  },
  cursor: {
    fill: tooltipTokens.containerColor,
  },
})
