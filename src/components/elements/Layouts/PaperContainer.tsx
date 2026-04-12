import { Paper } from '@/components/ui/Paper/Paper'
import type { SxProps } from '@/components/ui/types'
import { shape } from '@/themes/shape.stylex'
import React, { memo } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  topRadius?: boolean
  maxWidth?: 'md' | 'lg'
  children?: React.ReactNode
  sx?: SxProps
}

export const PaperContainer = memo(function PaperContainer(props: Props) {
  const { children, maxWidth = 'md', topRadius = true, ...rest } = props
  return (
    <Paper
      {...rest}
      elevation={0}
      sx={[styles.root, styles[maxWidth], !topRadius && styles.resetTopRadius, rest.sx]}>
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
  },
  md: {
    borderRadius: {
      default: shape.lg,
      [md]: 0,
    },
  },
  lg: {
    borderRadius: {
      default: shape.lg,
      [lg]: 0,
    },
  },
  resetTopRadius: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
})
