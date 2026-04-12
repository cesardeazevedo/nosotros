import { Paper } from '@/components/ui/Paper/Paper'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { spacing } from '@/themes/spacing.stylex'
import { css } from 'react-strict-dom'
import { ZapReceiptRoot } from './ZapReceipt'

type Props = {
  event: NostrEventDB
}

export const ZapReceiptFeedItem = (props: Props) => {
  const { event } = props
  return (
    <Paper outlined sx={styles.root}>
      <ZapReceiptRoot event={event} />
    </Paper>
  )
}

const styles = css.create({
  root: {
    marginTop: spacing.margin2,
  },
})
