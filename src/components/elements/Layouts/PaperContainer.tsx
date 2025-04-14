import { Paper } from '@/components/ui/Paper/Paper'
import { useSM } from '@/hooks/useMobile'
import { palette } from '@/themes/palette.stylex'
import React, { forwardRef } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  topRadius?: boolean
  children?: React.ReactNode
}

export const PaperContainer = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { children, topRadius = true, ...rest } = props
  const mobile = useSM()
  return (
    <Paper
      surface='surfaceContainerLowest'
      shape={mobile ? 'none' : 'lg'}
      {...rest}
      elevation={mobile ? 0 : 1}
      sx={[styles.root, !topRadius && styles.resetTopRadius]}
      ref={ref}>
      {children}
    </Paper>
  )
})

const styles = css.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 0,
    borderTopWidth: 0,
    borderBottomColor: palette.outlineVariant,
    borderBottomWidth: 1,
  },
  resetTopRadius: {
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
  },
})
