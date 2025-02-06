import type { SxProps } from '@/components/ui/types'
import React from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  sx?: SxProps
  margin?: boolean
  children: React.ReactNode
}

export const CenteredContainer = (props: Props) => (
  <html.div style={[styles.root, props.margin && styles.margin, props.sx]}>{props.children}</html.div>
)

const MOBILE = '@media (max-width: 599.95px)'

const styles = css.create({
  root: {
    width: '100%',
    margin: 'auto',
    maxWidth: {
      default: 600,
      [MOBILE]: '100%',
    },
    padding: 0,
    marginBottom: 0,
    overflowX: 'hidden',
  },
  margin: {
    paddingBottom: 100,
    marginTop: {
      default: 100,
      [MOBILE]: 0,
    },
  },
})
