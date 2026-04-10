import { Stack } from '@/components/ui/Stack/Stack'
import { Text } from '@/components/ui/Text/Text'
import type { SxProps } from '@/components/ui/types'
import { useMobile } from '@/hooks/useMobile'
import { spacing } from '@/themes/spacing.stylex'
import React from 'react'
import { css } from 'react-strict-dom'

export type Props = {
  leadingPrefix?: React.ReactNode
  leading?: React.ReactNode
  middle?: React.ReactNode
  children?: React.ReactNode
  sx?: SxProps
}

export const HeaderBase = (props: Props) => {
  const { leadingPrefix, leading, middle, children, sx } = props
  const isMobile = useMobile()
  return (
    <Stack gap={1} sx={[styles.root, isMobile && styles.root$mobile, sx]} justify='space-between'>
      <Stack gap={1} sx={styles.side}>
        {leadingPrefix}
        {typeof leading === 'string' ? (
          <Text variant='title' size='lg'>
            {leading}
          </Text>
        ) : leading ? (
          leading
        ) : null}
      </Stack>
      {middle ? <Stack sx={styles.middle}>{middle}</Stack> : null}
      <Stack sx={styles.actions}>{children}</Stack>
    </Stack>
  )
}

const styles = css.create({
  root: {
    position: 'relative',
    height: 64,
    minHeight: 64,
    paddingLeft: spacing.padding2,
    paddingRight: spacing.padding1,
    width: '100%',
  },
  root$mobile: {
    paddingLeft: 0,
  },
  side: {
    flex: 1,
    minWidth: 0,
  },
  middle: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  actions: {
    marginLeft: 'auto',
    flexShrink: 0,
  },
})
