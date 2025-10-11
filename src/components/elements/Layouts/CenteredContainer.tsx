import type { SxProps } from '@/components/ui/types'
import React from 'react'
import { css, html } from 'react-strict-dom'

export type Props = {
  sx?: SxProps
  margin?: boolean
  maxWidth?: 'md' | 'lg'
  children: React.ReactNode
}

export const CenteredContainer = (props: Props) => {
  const { maxWidth = 'sm', margin, children, sx } = props
  return <html.div style={[styles.root, margin && styles.margin, styles[maxWidth], sx]}>{children}</html.div>
}

const sm = '@media (max-width: 640px)'
const md = '@media (max-width: 960px)'
const lg = '@media (max-width: 1299.95px)'

const styles = css.create({
  root: {
    width: '100%',
    margin: 'auto',
    padding: 0,
    marginBottom: 0,
  },
  margin: {
    paddingBottom: 100,
    marginTop: {
      default: 64,
      [sm]: 0,
    },
  },
  sm: {
    maxWidth: {
      default: 640,
      [md]: '100%',
    },
  },
  md: {
    maxWidth: {
      default: 960,
      [md]: '100%',
    },
  },
  lg: {
    maxWidth: {
      default: 960,
      [lg]: '100%',
    },
    marginTop: {
      default: 64,
      [lg]: 0,
    },
  },
})
