import type { Props as PaperProps } from '@/components/ui/Paper/Paper'
import { Paper } from '@/components/ui/Paper/Paper'
import { useMobile } from '@/hooks/useMobile'
import { palette } from '@/themes/palette.stylex'
import React, { forwardRef } from 'react'
import { css } from 'react-strict-dom'

type Props = PaperProps & {
  children?: React.ReactNode
}

const PaperContainer = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { elevation = 0, children, ...rest } = props
  const mobile = useMobile()
  return (
    <Paper
      surface='surfaceContainerLowest'
      shape={mobile ? 'none' : 'lg'}
      {...rest}
      elevation={elevation ?? (mobile ? 0 : 3)}
      sx={[styles.root, rest.sx]}
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

export default PaperContainer
