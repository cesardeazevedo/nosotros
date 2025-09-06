import { Stack } from '@/components/ui/Stack/Stack'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useMobile, useSM } from '@/hooks/useMobile'
import { palette } from '@/themes/palette.stylex'
import { spacing } from '@/themes/spacing.stylex'
import { css } from 'react-strict-dom'

type Props = {
  renderLatencyColumn?: boolean
  renderPeopleColumn?: boolean
}

export const RelayTableHeader = (props: Props) => {
  const { renderLatencyColumn = true, renderPeopleColumn = true } = props
  const pubkey = useCurrentPubkey()
  const root = css.props(styles.root)
  const td = css.props(styles.cell)
  const isMobile = useMobile()
  const isSM = useSM()
  return (
    <thead {...root}>
      <tr>
        <th {...css.props([styles.cell, styles.minWidth])} align='left'>
          Relay
        </th>
        <th {...td} align='left'></th>
        {!isMobile && pubkey && renderPeopleColumn && (
          <th {...td} align='left'>
            <Stack gap={0.5}>People</Stack>
          </th>
        )}
        {renderLatencyColumn && !isSM && (
          <th {...td} align='left'>
            Latency (ms)
          </th>
        )}
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
    paddingLeft: spacing.padding2,
    paddingRight: 0,
    whiteSpace: 'nowrap',
  },
  iconButton: {
    width: 22,
    height: 22,
    minWidth: 22,
    minHeight: 22,
  },
  minWidth: {
    minWidth: 220,
  },
})
