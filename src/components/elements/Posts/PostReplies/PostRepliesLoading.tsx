import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import React from 'react'
import { css } from 'react-strict-dom'

type Props = {
  rows?: number
}

export const PostRepliesLoading = React.memo((props: Props) => {
  const { rows = 1 } = props
  return (
    <>
      {[...Array(rows).keys()].map((key) => (
        <Stack key={key} sx={styles.root} align='flex-start' gap={1}>
          <Skeleton variant='circular' sx={styles.circular} />
          <Stack horizontal={false} justify='space-between' align='flex-start' sx={styles.content}>
            <Skeleton animation='wave' variant='rectangular' sx={styles.rect1} />
            <Skeleton animation='wave' variant='rectangular' sx={styles.rect2} />
          </Stack>
        </Stack>
      ))}
    </>
  )
})

const styles = css.create({
  root: {
    position: 'relative',
    paddingBottom: spacing.padding1,
    paddingInline: spacing.padding2,
  },
  content: {
    width: '100%',
  },
  circular: {
    minWidth: 40,
    minHeight: 40,
  },
  rect1: {
    width: '30%',
    height: 14,
    borderRadius: shape.lg,
    marginBottom: spacing.margin1,
  },
  rect2: {
    width: '90%',
    height: 16,
    borderRadius: shape.lg,
  },
})
