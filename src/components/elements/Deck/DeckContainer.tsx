import React from 'react'
import { html, css } from 'react-strict-dom'

type Props = {
  children: React.ReactNode
}

export const DeckContainer = (props: Props) => <html.div style={styles.root}>{props.children}</html.div>

const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'row',
    height: 'calc(100vh - 64px)',
    overflowX: 'auto',
    overflowY: 'hidden',
    marginLeft: 75,
  },
})
