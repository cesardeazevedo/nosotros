import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  rows?: number
}

export const PostMediaLoading = memo(({ rows = 2 }: Props) => {
  const list = [...Array(rows).keys()]
  return (
    <html.div style={styles.root}>
      {list.map((key) => (
        <Stack horizontal wrap gap={0.5} key={key} sx={styles.row}>
          <Skeleton animation='wave' variant='rectangular' sx={styles.item} />
          <Skeleton animation='wave' variant='rectangular' sx={styles.item} />
          <Skeleton animation='wave' variant='rectangular' sx={styles.item} />
        </Stack>
      ))}
    </html.div>
  )
})

const styles = css.create({
  root: {
    paddingBottom: 80,
  },
  row: {
    marginTop: 4,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
  item: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    aspectRatio: '1 / 1',
  },
})
