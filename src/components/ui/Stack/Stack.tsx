import React, { forwardRef } from 'react'
import { css, html } from 'react-strict-dom'
import type { StrictClickEvent, StrictReactDOMProps } from 'react-strict-dom/dist/types/StrictReactDOMProps'
import type { SxProps } from '../types'

export type Props = {
  as?: 'div' | 'span' | 'p' | 'header' | 'main' | 'footer' | 'section' | 'article'
  sx?: SxProps
  horizontal?: boolean
  gap?: 0 | 0.5 | 1 | 2 | 3 | 4 | 5
  align?: 'center' | 'flex-start' | 'flex-end' | 'stretch'
  justify?: 'center' | 'flex-start' | 'flex-end' | 'stretch' | 'space-between' | 'space-around' | 'space-evenly'
  role?: StrictReactDOMProps['role']
  wrap?: boolean
  grow?: boolean
  onClick?: (e: StrictClickEvent) => void
  onMouseMove?: (e: MouseEvent) => void
  children?: React.ReactNode
}

export const Stack = forwardRef<HTMLDivElement, Props>(function Stack(props, ref) {
  const {
    sx,
    as = 'div',
    children,
    horizontal = true,
    gap = 0,
    align: alignProp,
    justify = 'flex-start',
    wrap,
    grow,
    ...other
  } = props

  const Root = html[as]
  const align = alignProp ?? (horizontal ? 'center' : 'stretch')

  return (
    <Root
      ref={ref}
      style={[
        styles.root,
        !horizontal && styles.root$vertical,
        styles[`align$${align}`],
        justify !== 'flex-start' && styles[`justify$${justify}`],
        gap !== undefined && gap !== 0 ? styles[`gap$${gap}`] : false,
        !!wrap && styles[`flexWrap$${wrap ? 'wrap' : 'nowrap'}`],
        grow && styles.flexGrow,
        sx,
      ]}
      {...other}>
      {children}
    </Root>
  )
})

const styles = css.create({
  root: {
    display: 'flex',
  },
  root$vertical: {
    flexDirection: 'column',
  },
  ['align$center']: { alignItems: 'center' },
  ['align$flex-start']: { alignItems: 'flex-start' },
  ['align$flex-end']: { alignItems: 'flex-end' },
  ['align$stretch']: { alignItems: 'stretch' },
  ['justify$center']: { justifyContent: 'center' },
  ['justify$flex-start']: { justifyContent: 'flex-start' },
  ['justify$flex-end']: { justifyContent: 'flex-end' },
  ['justify$stretch']: { justifyContent: 'stretch' },
  ['justify$space-around']: { justifyContent: 'space-around' },
  ['justify$space-between']: { justifyContent: 'space-between' },
  ['justify$space-evenly']: { justifyContent: 'space-evenly' },
  ['gap$0']: { gap: '0px' },
  ['gap$0.5']: { gap: '4px' },
  ['gap$1']: { gap: '8px' },
  ['gap$2']: { gap: '16px' },
  ['gap$3']: { gap: '24px' },
  ['gap$4']: { gap: '32px' },
  ['gap$5']: { gap: '40px' },
  flexWrap$wrap: { flexWrap: 'wrap' },
  flexWrap$nowrap: { flexWrap: 'nowrap' },
  flexGrow: { flexGrow: 1 },
})
