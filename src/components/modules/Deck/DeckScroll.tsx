import React from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  children: React.ReactNode
}
export const DeckScroll = (props: Props) => <html.div style={styles.root}>{props.children}</html.div>

const styles = css.create({
  root: {
    overflowX: 'hidden',
    overflowY: 'auto',
  },
})
