import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { css, html } from 'react-strict-dom'

type Props = {
  rows?: number
}

export const ListRowLoading = ({ rows = 4 }: Props) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <html.div key={index} style={[styles.row, index === rows - 1 && styles.rowLast]}>
          <html.div style={[styles.cell, styles.cellFirst]}>
            <Skeleton variant='circular' sx={styles.avatar} />
            <Skeleton sx={styles.name} />
          </html.div>
          <html.div style={styles.cell}>
            <Skeleton sx={styles.kind} />
          </html.div>
          <html.div style={styles.cell}>
            <Skeleton sx={styles.title} />
          </html.div>
          <html.div style={styles.cell}>
            <Skeleton sx={styles.count} />
          </html.div>
          <html.div style={[styles.cell, styles.cellLast]}>
            <Skeleton sx={styles.members} />
          </html.div>
          <html.div style={styles.cell} />
        </html.div>
      ))}
    </>
  )
}

const styles = css.create({
  row: {
    display: 'grid',
    gridTemplateColumns: '220px 180px 1fr 120px 180px 40px',
    gap: spacing.padding1,
    paddingBlock: spacing.padding1,
    borderBottom: '1px solid',
    borderColor: palette.outlineVariant,
  },
  rowLast: {
    borderBottom: 'none',
  },
  cell: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.padding1,
  },
  cellFirst: {
    paddingInlineStart: spacing.padding2,
  },
  cellLast: {
    paddingInlineEnd: spacing.padding2,
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 24,
    height: 24,
  },
  name: {
    height: 16,
    width: 120,
  },
  kind: {
    height: 16,
    width: 120,
  },
  title: {
    height: 16,
    width: '60%',
  },
  count: {
    height: 16,
    width: 72,
  },
  members: {
    height: 16,
    width: 60,
  },
})
