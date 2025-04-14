import type { SxProps } from '@/components/ui/types'
import React from 'react'
import { css, html } from 'react-strict-dom'

export type Props = {
  sx?: SxProps
  margin?: boolean
  maxWidth?: 'md' | 'lg' | 'xl'
  children: React.ReactNode
}

export const CenteredContainer = (props: Props) => {
  const { maxWidth = 'md', margin, children, sx } = props
  return (
    <html.div style={[styles.root, margin && styles.margin, styles[maxWidth], sx]}>
      <style>{`body {overflow-x: hidden}`}</style>
      {children}
    </html.div>
  )
}

const MOBILE = '@media (max-width: 599.95px)'
const XL = '@media (max-width: 1299.95px)'

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
      [MOBILE]: 0,
    },
  },
  md: {
    maxWidth: {
      default: 600,
      [MOBILE]: '100%',
    },
  },
  lg: {
    maxWidth: {
      default: 960,
      [MOBILE]: '100%',
      [XL]: '100%',
    },
    marginTop: {
      default: 64,
      [XL]: 0,
    },
  },
  xl: {
    maxWidth: {
      default: 1200,
      [MOBILE]: '100%',
    },
  },
})
