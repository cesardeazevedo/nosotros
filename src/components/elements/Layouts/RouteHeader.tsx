import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import { spacing } from '@/themes/spacing.stylex'
import React from 'react'
import { css } from 'react-strict-dom'

export type Props = {
  size?: 'sm' | 'md'
  label?: React.ReactNode
  leading?: React.ReactNode
  children?: React.ReactNode
}

export const RouteHeader = (props: Props) => {
  const { label, leading, children, size = 'md' } = props
  return (
    <Stack gap={1} sx={styles[size]} justify='space-between'>
      {props.label ? (
        <Text variant='headline' size='sm' sx={styles.label}>
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
  md: {
    padding: spacing.padding2,
  },
  sm: {
    padding: spacing.padding1,
  },
  label: {
    marginLeft: spacing.margin1,
  },
})
