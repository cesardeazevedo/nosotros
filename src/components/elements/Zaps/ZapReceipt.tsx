import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { useEventTag } from '@/hooks/useEventUtils'
import { ZapReceiptEvent } from './ZapReceiptEvent'
import { ZapReceiptProfile } from './ZapReceiptProfile'

type Props = {
  event: NostrEventDB
}

export const ZapReceiptRoot = (props: Props) => {
  const { event } = props
  const isProfileZap = !useEventTag(event, 'e')
  return <>{isProfileZap ? <ZapReceiptProfile event={event} /> : <ZapReceiptEvent />}</>
}
