import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css } from 'react-strict-dom'

export const ThreadLoading = memo(function ThreadLoading() {
  return (
    <Stack sx={styles.root} gap={1}>
      <Skeleton animation='wave' variant='circular' sx={styles.avatar} />
      <Skeleton animation='wave' variant='rectangular' sx={styles.content} />
    </Stack>
  )
})

const styles = css.create({
  root: {
    paddingBlock: spacing.padding1,
    paddingInline: spacing.padding2,
  },
  avatar: {
    width: 40,
    height: 40,
  },
  content: {
    width: '50%',
    height: 50,
  },
})
