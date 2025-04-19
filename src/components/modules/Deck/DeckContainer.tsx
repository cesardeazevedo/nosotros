import type { SxProps } from '@/components/ui/types'
import React from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  sx?: SxProps
  children: React.ReactNode
}

export const DeckContainer = (props: Props) => {
  return <html.div style={[styles.root, props.sx]}>{props.children}</html.div>
}

const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
    overflowX: 'auto',
    overflowY: 'hidden',
  },
})
