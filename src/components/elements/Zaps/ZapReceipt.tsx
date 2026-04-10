import { Paper } from '@/components/ui/Paper/Paper'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useEventTag } from '@/hooks/useEventUtils'
import { spacing } from '@/themes/spacing.stylex'
import { css } from 'react-strict-dom'
import { ZapReceiptEvent } from './ZapReceiptEvent'
import { ZapReceiptProfile } from './ZapReceiptProfile'

type Props = {
  event: NostrEventDB
}

export const ZapReceiptRoot = (props: Props) => {
  const { event } = props
  const isProfileZap = !useEventTag(event, 'e')
  return <Paper outlined sx={styles.root}>{isProfileZap ? <ZapReceiptProfile event={event} /> : <ZapReceiptEvent event={event} />}</Paper>
}

const styles = css.create({
  root: {
    marginInline: spacing.margin2,
  }
})
