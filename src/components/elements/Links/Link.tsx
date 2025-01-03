import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { typeFace } from '@/themes/typeFace.stylex'
import React from 'react'
import { css, html } from 'react-strict-dom'
import type { StrictReactDOMAnchorProps } from 'react-strict-dom/dist/types/StrictReactDOMAnchorProps'

type Props = StrictReactDOMAnchorProps & {
  underline?: boolean
  children?: React.ReactNode | string
  blank?: boolean
}

export const Link = (props: Props) => {
  const { underline, blank = true, ...rest } = props
  const blankProps = (blank ? { target: '_blank', rel: 'noopener noreferrer' } : {}) as StrictReactDOMAnchorProps
  return (
    <html.a {...blankProps} style={[styles.root, underline && styles.root$underline]} {...rest}>
      {props.children}
    </html.a>
  )
}

const styles = css.create({
  root: {
    display: 'contents',
    fontWeight: typeFace.bold,
  },
  root$underline: {
    textDecoration: 'inherit',
    ':hover': {
      textDecoration: 'underline',
    },
  },
  background: {
    paddingInline: spacing['padding1'],
    backgroundColor: palette.surfaceContainer,
    borderRadius: shape.lg,
  },
})
