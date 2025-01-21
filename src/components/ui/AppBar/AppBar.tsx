import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import React, { forwardRef } from 'react'
import { css } from 'react-strict-dom'
import { Stack } from '../Stack/Stack'
import type { SxProps } from '../types'

type Props = {
  sx?: SxProps
  children: React.ReactNode
}

export const AppBar = forwardRef<HTMLDivElement, Props>((props, ref) => {
  return (
    <Stack as='header' sx={[styles.root, props.sx]} justify='space-between' ref={ref}>
      {props.children}
    </Stack>
  )
})

const styles = css.create({
  root: {
    position: 'sticky',
    top: 0,
    insetInline: 0,
    height: 64,
    zIndex: 200,
    paddingLeft: spacing.padding3,
    paddingRight: spacing.padding3,
    backgroundColor: palette.surfaceContainerLowest,
    borderBottomColor: palette.outlineVariant,
    borderBottomWidth: 1,
  },
})
