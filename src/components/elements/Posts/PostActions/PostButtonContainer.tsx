import type { SxProps } from '@/components/ui/types'
import { spacing } from '@/themes/spacing.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import React from 'react'
import { css, html } from 'react-strict-dom'

export interface ContainerProps {
  value?: number | false | React.ReactElement
}

type Props = {
  sx?: SxProps
  children: React.ReactNode
  ref?: React.Ref<HTMLDivElement>
}

export const ButtonContainer = (props: Props & ContainerProps) => {
  const { value, children, sx, ref } = props
  if (value) {
    return (
      <html.span style={[styles.root, sx]} ref={ref}>
        {children}
        {value}
      </html.span>
    )
  }
  return children
}

const styles = css.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing['padding0.5'],
    fontSize: typeScale.bodySize$lg,
    marginRight: spacing.margin1,
    fontWeight: 500,
  },
})
