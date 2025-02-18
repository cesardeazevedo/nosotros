import { Paper } from '@/components/ui/Paper/Paper'
import { useMobile } from '@/hooks/useMobile'
import { palette } from '@/themes/palette.stylex'
import React, { forwardRef } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  children?: React.ReactNode
}

export const PaperContainer = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { children, ...rest } = props
  const mobile = useMobile()
  return (
    <Paper
      surface='surfaceContainerLowest'
      shape={mobile ? 'none' : 'lg'}
      {...rest}
      elevation={mobile ? 0 : 1}
      sx={styles.root}
      ref={ref}>
      {children}
    </Paper>
  )
})

const styles = css.create({
  root: {
    marginBottom: 0,
    borderTopWidth: 0,
    borderBottomColor: palette.outlineVariant,
    borderBottomWidth: 1,
  },
})
