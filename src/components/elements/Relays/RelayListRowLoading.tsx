import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  rows?: number
}

export const RelayListRowLoading = memo(function RelayListRowLoading(props: Props) {
  const list = [...Array(props.rows || 8).keys()]
  return list.map((value) => (
    <Stack key={value} gap={2} sx={styles.root} align='stretch'>
      <Skeleton variant='circular' sx={styles.avatar} />
      <Skeleton variant='rectangular' sx={styles.content} />
    </Stack>
  ))
})

const styles = css.create({
  root: {
    paddingInline: spacing.padding2,
    paddingBlock: spacing.padding1,
  },
  avatar: {
    width: 32,
    height: 32,
  },
  content: {
    height: 54,
    flex: 1,
    width: '100%',
    borderRadius: shape.lg,
  },
})
