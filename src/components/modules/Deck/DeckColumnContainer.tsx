import type { SxProps } from '@/components/ui/types'
import { palette } from '@/themes/palette.stylex'
import React from 'react'
import { html, css } from 'react-strict-dom'

type Props = {
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  sx?: SxProps
  paper?: boolean
}

export const DeckColumnContainer = (props: Props) => {
  const { size = 'md', children, paper = true, sx } = props
  return <html.div style={[styles.root, sizes[size], paper && styles.paper, sx]}>{children}</html.div>
}

const sizes = css.create({
  sm: {
    minWidth: 390,
    maxWidth: 390,
  },
  md: {
    minWidth: 600,
    maxWidth: 600,
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
    height: '100%',
    position: 'relative',
    borderLeftWidth: 0,
    borderRightWidth: 1,
    borderColor: palette.outlineVariant,
    overflow: 'hidden',
  },
  paper: {
    backgroundColor: palette.surfaceContainerLowest,
  },
})
