import { Divider } from '@/components/ui/Divider/Divider'
import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import React, { memo } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  rows?: number
}

export const NotificationLoading = memo(({ rows = 2 }: Props) => {
  const list = [...Array(rows).keys()]

  return list.map((key) => (
    <React.Fragment key={key}>
      <Stack gap={2} sx={styles.root}>
        <Skeleton variant='circular' animation='wave' sx={styles.circle} />
        <Skeleton variant='rectangular' animation='wave' sx={styles.content} />
      </Stack>
      <Divider />
    </React.Fragment>
  ))
})

const styles = css.create({
  root: {
    paddingBlock: spacing.padding2,
    paddingInline: spacing.padding2,
  },
  circle: {
    width: 40,
    height: 40,
  },
  content: {
    width: '90%',
    height: 50,
    borderRadius: shape.lg,
  },
})
