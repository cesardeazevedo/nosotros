import { Paper } from '@/components/ui/Paper/Paper'
import type { SxProps } from '@/components/ui/types'
import { useMobile } from '@/hooks/useMobile'
import { useIsDarkTheme } from '@/hooks/useTheme'
import { palette } from '@/themes/palette.stylex'
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
  const isMobile = useMobile()
  const isDark = useIsDarkTheme()
  return (
    <Paper
      {...rest}
      outlined={isDark && !isMobile}
      elevation={isDark ? 0 : 1}
      surface='surfaceContainerLowest'
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
