import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { spacing } from '@/themes/spacing.stylex'
import { css, html } from 'react-strict-dom'

function PostLoading() {
  return (
    <html.div style={styles.root}>
      <Stack horizontal>
        <Skeleton animation='wave' variant='circular' sx={styles.circular} />
        <Stack horizontal={false}>
          <Skeleton animation='wave' variant='rectangular' sx={styles.title} />
          <Skeleton animation='wave' variant='rectangular' sx={styles.title2} />
        </Stack>
      </Stack>
      <Skeleton animation='wave' variant='rectangular' sx={styles.content} />
    </html.div>
  )
}

const styles = css.create({
  root: {
    width: '100%',
    padding: spacing.padding2,
    position: 'relative',
  },
  circular: {
    width: 40,
    height: 40,
    marginRight: spacing.margin1,
  },
  title: {
    width: 140,
    height: 12,
  },
  title2: {
    width: 80,
    height: 12,
    marginTop: spacing['margin0.5'],
  },
  content: {
    marginTop: spacing.margin1,
    width: '100%',
    height: 110,
  },
})

export default PostLoading
