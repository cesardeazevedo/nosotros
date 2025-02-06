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
    marginTop: 4,
  },
  item: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    flex: '1 1 calc(33.33% - 20px)',
    aspectRatio: '1 / 1',
  },
})
