import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  rows?: number
}

export const NotificationLoading = memo(({ rows = 2 }: Props) => {
  const list = [...Array(rows).keys()]

  return list.map((key) => (
    <Stack key={key} gap={2} sx={styles.root}>
      <Skeleton variant='circular' animation='wave' sx={styles.circle} />
      <Skeleton variant='rectangular' animation='wave' sx={styles.content} />
    </Stack>
  ))
})

const styles = css.create({
  root: {
    paddingBlock: spacing.padding1,
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
