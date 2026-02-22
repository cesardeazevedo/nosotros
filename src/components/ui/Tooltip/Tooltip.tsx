import React from 'react'
import { css, html } from 'react-strict-dom'
import { PopoverBase } from '../Popover/PopoverBase'
import { FloatingDelayGroupLazy } from '../Popover/FloatingDelayGroupLazy'
import type { IPopoverBaseProps } from '../Popover/PopoverBase.types'
import { PopoverHoverRender } from '../Popover/PopoverHoverRender'
import { tooltipTokens } from './Tooltip.stylex'

type Props = Omit<IPopoverBaseProps, 'children' | 'contentRenderer'> & {
  text: React.ReactNode
  enterDelay?: number
  keepMounted?: boolean
  children: React.ReactNode
}

export const Tooltip = function Tooltip(props: Props) {
  const { enterDelay = 700, placement = 'bottom', children, text, keepMounted, ...other } = props
  return (
    <PopoverHoverRender content={children}>
      <FloatingDelayGroupLazy delay={enterDelay}>
        <PopoverBase
          cursor='arrow'
          {...other}
          placement={placement}
          preventAutoFocus
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
          {({ getProps, setRef, close }) => (
            <html.span {...getProps()} ref={setRef} onMouseLeave={!keepMounted ? close : undefined}>
              {children}
            </html.span>
          )}
        </PopoverBase>
      </FloatingDelayGroupLazy>
    </PopoverHoverRender>
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
