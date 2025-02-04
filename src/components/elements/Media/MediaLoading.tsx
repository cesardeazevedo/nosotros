import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { memo } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  rows?: number
}

export const PostMediaLoading = memo(({ rows = 2 }: Props) => {
  const list = [...Array(rows).keys()]
  return list.map((key) => (
    <Stack horizontal wrap gap={0.5} key={key} sx={styles.root}>
      <Skeleton animation='wave' variant='rectangular' sx={styles.item} />
      <Skeleton animation='wave' variant='rectangular' sx={styles.item} />
      <Skeleton animation='wave' variant='rectangular' sx={styles.item} />
    </Stack>
  ))
})

const styles = css.create({
  root: {
    marginBottom: 4,
  },
  item: {
    width: 196,
    height: 196,
    borderRadius: 0,
  },
})
