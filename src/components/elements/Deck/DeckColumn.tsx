import type { SxProps } from '@/components/ui/types'
import { palette } from '@/themes/palette.stylex'
import React from 'react'
import { html, css } from 'react-strict-dom'

type Props = {
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  sx?: SxProps
}

export const DeckColumn = (props: Props) => {
  const { size = 'md', children, sx } = props
  return <html.div style={[styles.root, sizes[size], sx]}>{children}</html.div>
}

const sizes = css.create({
  sm: {
    minWidth: 390,
    maxWidth: 390,
  },
  md: {
    minWidth: 550,
    maxWidth: 550,
  },
  lg: {
    minWidth: 700,
    maxWidth: 700,
  },
})

const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    borderLeftWidth: 0,
    borderRightWidth: 1,
    height: '100%',
    position: 'relative',
    borderColor: palette.outlineVariant,
    overflowX: 'hidden',
  },
})
