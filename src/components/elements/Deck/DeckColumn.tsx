import { palette } from '@/themes/palette.stylex'
import React from 'react'
import { html, css } from 'react-strict-dom'

type Props = {
  children: React.ReactNode
}

export const DeckColumn = (props: Props) => {
  return <html.div style={styles.root}>{props.children}</html.div>
}

const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 550,
    borderLeftWidth: 0,
    borderRightWidth: 1,
    height: '100%',
    position: 'relative',
    borderColor: palette.outlineVariant,
  },
})
