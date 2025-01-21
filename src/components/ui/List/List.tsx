import React from 'react'
import { css, html } from 'react-strict-dom'
import type { SxProps } from '../types'

type Props = {
  children?: React.ReactNode
  sx?: SxProps
}

export const List = (props: Props) => {
  const { children, sx } = props
  return <html.div style={[styles.root, sx]}>{children}</html.div>
}

const styles = css.create({
  root: {
    color: 'unset',
    outline: 'none',
    paddingLeft: 0,
    paddingRight: 0,
    position: 'relative',
    maxHeight: 'inherit',
    borderRadius: 'inherit',
  },
})
