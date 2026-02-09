import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { Stack } from '@/components/ui/Stack/Stack'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css, html } from 'react-strict-dom'

type Props = {
  rows?: number
}

export const ListCardLoading = memo(function ListCardLoading(props: Props) {
  const { rows = 6 } = props
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <html.div key={index} style={styles.card}>
          <html.div style={styles.cardMedia}>
            <Skeleton sx={styles.media} />
          </html.div>
          <Stack justify='space-between' align='center' sx={styles.cardMeta}>
            <Stack gap={1} align='center'>
              <Skeleton variant='circular' sx={styles.avatar} />
              <Skeleton sx={styles.author} />
            </Stack>
            <Skeleton sx={styles.icon} />
          </Stack>
          <Stack horizontal={false} gap={1} sx={styles.content}>
            <Skeleton sx={styles.lineSm} />
            <Skeleton sx={styles.lineMd} />
            <Skeleton sx={styles.lineLg} />
            <Stack justify='space-between' align='center' sx={styles.footer}>
              <Skeleton sx={styles.lineXs} />
              <Skeleton sx={styles.avatars} />
            </Stack>
          </Stack>
        </html.div>
      ))}
    </>
  )
})

const styles = css.create({
  card: {
    height: '100%',
    borderRadius: shape.lg,
    border: '1px solid',
    borderColor: palette.outlineVariant,
    padding: spacing.padding1,
  },
  cardMedia: {
    height: 140,
    borderRadius: shape.md,
    overflow: 'hidden',
    backgroundColor: palette.surfaceContainerHighest,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  cardMeta: {
    padding: spacing.padding1,
    marginTop: spacing.margin1,
  },
  content: {
    padding: spacing.padding1,
    flexGrow: 1,
  },
  avatar: {
    width: 24,
    height: 24,
  },
  author: {
    width: 90,
    height: 14,
  },
  icon: {
    width: 18,
    height: 18,
  },
  lineXs: {
    width: 70,
    height: 10,
  },
  lineSm: {
    width: 90,
    height: 10,
  },
  lineMd: {
    width: '70%',
    height: 12,
  },
  lineLg: {
    width: '90%',
    height: 12,
  },
  footer: {
    marginTop: 'auto',
  },
  avatars: {
    width: 80,
    height: 16,
  },
})
