import { css } from 'react-strict-dom'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'

export const RelayDiscoveryTableHeader = () => {
  const root = css.props(styles.root)
  const td = css.props(styles.cell)
  return (
    <thead {...root}>
      <tr>
        <th {...td} align='left'>
          Relay
        </th>
        <th {...td} align='right'>
          People
        </th>
        <th {...td} align='left'>
          Latency (ms)
        </th>
        <th></th>
      </tr>
    </thead>
  )
}

const styles = css.create({
  root: {
    borderBottom: '1px solid',
    borderColor: palette.outlineVariant,
  },
  cell: {
    paddingBlock: spacing.padding1,
    paddingInline: spacing.padding2,
  },
})
