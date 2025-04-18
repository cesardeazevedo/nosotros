import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  rows?: number
}

export const RelayListRowLoading = memo(function RelayListRowLoading(props: Props) {
  const list = [...Array(props.rows || 10).keys()]
  return list.map((value) => (
    <Stack key={value} gap={1} sx={styles.root}>
      <Skeleton variant='circular' sx={styles.avatar} />
      <Stack horizontal={false} gap={0.5}>
        <Skeleton variant='rectangular' sx={[styles.content, styles.width(100, 250)]} />
        <Skeleton variant='rectangular' sx={[styles.content, styles.width(80, 200)]} />
      </Stack>
    </Stack>
  ))
})

const styles = css.create({
  root: {
    padding: spacing.padding1,
    paddingLeft: spacing.padding2,
  },
  avatar: {
    width: 32,
    height: 32,
  },
  content: {
    height: 12,
  },
  width: (min: number, max: number) => ({
    width: Math.floor(Math.random() * (max - min + 1)) + min,
  }),
})
