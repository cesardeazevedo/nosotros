import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { SxProps } from '@/components/ui/types'
import { spacing } from '@/themes/spacing.stylex'
import React from 'react'
import { css } from 'react-strict-dom'

export type Props = {
  label?: React.ReactNode
  leading?: React.ReactNode
  children?: React.ReactNode
  sx?: SxProps
}

export const HeaderBase = (props: Props) => {
  const { label, leading, children, sx } = props
  return (
    <Stack gap={1} sx={[styles.root, sx]} justify='space-between'>
      {props.label ? (
        <Text variant='headline' size='sm'>
          {label}
        </Text>
      ) : leading ? (
        leading
      ) : null}
      {children}
    </Stack>
  )
}

const styles = css.create({
  root: {
    height: 64,
    minHeight: 64,
    paddingLeft: spacing.padding2,
    paddingRight: spacing.padding1,
  },
})
