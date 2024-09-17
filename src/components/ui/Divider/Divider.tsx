import React, { forwardRef } from 'react'
import { css, html } from 'react-strict-dom'
import type { SxProps } from '../types'
import { dividerTokens } from './Divider.stylex'

type Props = {
  sx?: SxProps
  orientation?: 'horizontal' | 'vertical'
  inset?: boolean
  insetStart?: boolean
  insetEnd?: boolean
  children?: React.ReactNode
}

export const Divider = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { sx, orientation = 'horizontal', inset, insetStart, insetEnd, children } = props
  const renderLine = () => (
    <html.div
      style={[
        styles.line,
        styles[`line$${orientation}`],
        (inset || insetStart) && styles[`line$${orientation}$insetStart`],
        (inset || insetEnd) && styles[`line$${orientation}$insetEnd`],
      ]}
    />
  )

  return (
    <html.div ref={ref} style={[styles.root, styles[`root$${orientation}`], sx]}>
      {children ? (
        <>
          {renderLine()}
          <html.div style={styles[`textContainer$${orientation}`]}>
            <html.div style={styles.text}>{children}</html.div>
          </html.div>
          {renderLine()}
        </>
      ) : (
        renderLine()
      )}
    </html.div>
  )
})

const styles = css.create({
  root: {
    display: 'flex',
    color: dividerTokens.color,
    position: 'relative',
  },
  root$horizontal: {
    flexDirection: 'row',
    width: '100%',
    height: dividerTokens.thickness,
  },
  root$vertical: {
    flexDirection: 'column',
    width: dividerTokens.thickness,
    alignSelf: 'stretch',
  },
  line: {
    display: 'flex',
    flexGrow: 1,
    color: 'inherit',
    '::before': {
      background: 'currentColor',
      content: '',
      width: '100%',
      height: '100%',
      borderRadius: dividerTokens.shape,
    },
  },
  line$horizontal: {
    flexDirection: 'row',
    height: 'inherit',
  },
  line$vertical: {
    flexDirection: 'column',
    width: 'inherit',
  },
  line$horizontal$insetStart: {
    paddingInlineStart: dividerTokens.insetLeadingSpace,
  },
  line$horizontal$insetEnd: {
    paddingInlineEnd: dividerTokens.insetTrailingSpace,
  },
  line$vertical$insetStart: {
    paddingBlockStart: dividerTokens.insetLeadingSpace,
  },
  line$vertical$insetEnd: {
    paddingBlockEnd: dividerTokens.insetTrailingSpace,
  },
  textContainer$horizontal: {
    marginInlineStart: dividerTokens.textLeadingSpace,
    marginInlineEnd: dividerTokens.textTrailingSpace,
  },
  textContainer$vertical: {
    marginBlockStart: dividerTokens.textLeadingSpace,
    marginBlockEnd: dividerTokens.textTrailingSpace,
  },
  text: {
    position: 'absolute',
    textAlign: 'center',
    transform: 'translateX(-50%) translateY(-50%)',
    color: dividerTokens.textColor,
    fontFamily: dividerTokens.textFont,
    fontSize: dividerTokens.textSize,
    fontWeight: dividerTokens.textWeight,
    lineHeight: dividerTokens.textLineHeight,
    letterSpacing: dividerTokens.textLetterSpacing,
  },
})
