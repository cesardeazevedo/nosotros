import React from 'react'
import { html, css } from 'react-strict-dom'

type Props = {
  children?: React.ReactNode
}

export const List = (props: Props) => {
  const { children } = props
  return <html.div style={styles.root}>{children}</html.div>
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
