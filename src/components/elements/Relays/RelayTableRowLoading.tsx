import { RelayFriendsListLoading } from '@/components/elements/Relays/RelayFriendsListLoading'
import { RelayTableHeader } from '@/components/elements/Relays/RelayTableHeader'
import { Skeleton } from '@/components/ui/Skeleton/Skeleton'
import { useCurrentPubkey } from '@/hooks/useRootStore'
import { palette } from '@/themes/palette.stylex'
import { shape } from '@/themes/shape.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { memo } from 'react'
import { css } from 'react-strict-dom'

type Props = {
  rows?: number
}

export const RelayTableRowLoading = memo(function RelayTableRowLoading(props: Props) {
  const pubkey = useCurrentPubkey()
  const list = [...Array(props.rows || 10).keys()]
  const row = css.props(styles.row)
  const cell = css.props(styles.cell)
  return (
    <>
      <table {...css.props(styles.table)}>
        <RelayTableHeader />
        <tbody>
          {list.map((key) => (
            <tr key={key} {...row}>
              <td {...cell}>
                <Skeleton sx={[styles.chip, styles.width(70, 180)]} />
              </td>
              {pubkey && (
                <td {...cell}>
                  <RelayFriendsListLoading />
                </td>
              )}
              <td align='left' {...cell}>
                <Skeleton sx={[styles.latency, styles.width(30, 50)]} />
              </td>
              <td align='right' {...cell}>
                <Skeleton sx={styles.button} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
})

const styles = css.create({
  table: {
    width: '100%',
  },
  row: {
    width: '100%',
    padding: spacing.padding2,
    paddingInline: spacing.padding2,
    borderBottom: '1px solid',
    borderColor: palette.outlineVariant,
  },
  cell: {
    paddingInline: spacing.padding2,
    paddingBlock: spacing.padding1,
  },
  chip: {
    width: 180,
    height: 28,
    borderRadius: shape.xl,
  },
  latency: {
    height: 20,
    borderRadius: shape.xl,
  },
  button: {
    width: 80,
    height: 40,
    borderRadius: shape.lg,
  },
  width: (min: number, max: number) => ({
    width: Math.floor(Math.random() * (max - min + 1)) + min,
  }),
})
