import { Stack } from '@/components/ui/Stack/Stack'
import type { SxProps } from '@/components/ui/types'
import { spacing } from '@/themes/spacing.stylex'
import { typeScale } from '@/themes/typeScale.stylex'
import React from 'react'
import { css } from 'react-strict-dom'

export interface ContainerProps {
  value?: number | false | React.ReactElement
}

type Props = {
  sx?: SxProps
  children: React.ReactNode
}

export const ButtonContainer = (props: Props & ContainerProps) => {
  const { value, children, sx } = props
  if (value) {
    return (
      <Stack sx={[styles.root, !value && styles.empty, sx]} gap={0.5}>
        {children}
        {value || ''}
      </Stack>
    )
  }
  return children
}

const styles = css.create({
  root: {
    fontSize: typeScale.bodySize$lg,
    marginRight: spacing.margin1,
    fontWeight: 500,
  },
  empty: {
    marginRight: spacing['margin0.5'],
  },
})
