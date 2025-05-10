import { Paper } from '@/components/ui/Paper/Paper'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import React, { forwardRef } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  topRadius?: boolean
  maxWidth?: 'md' | 'lg'
  children?: React.ReactNode
}

export const PaperContainer = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { children, maxWidth = 'md', topRadius = true, ...rest } = props
  return (
    <Paper
      surface='surfaceContainerLowest'
      {...rest}
      elevation={1}
      sx={[styles.root, styles[maxWidth], !topRadius && styles.resetTopRadius]}
      ref={ref}>
      {children}
    </Paper>
  )
})

const md = '@media (max-width: 960px)'
const lg = '@media (max-width: 1299.95px)'

const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 0,
    borderTopWidth: 0,
    borderBottomColor: palette.outlineVariant,
    borderBottomWidth: 1,
  },
  lg: {
    borderRadius: {
      default: shape.lg,
      [lg]: 0,
    },
  },
  md: {
    borderRadius: {
      default: shape.lg,
      [md]: 0,
    },
  },
  resetTopRadius: {
    borderRadius: 0,
  },
})
