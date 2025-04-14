import type { NostrEventMetadata } from '@/nostr/types'
import { ZapReceipt } from '@/stores/zaps/zap.receipt.store'
import { useState } from 'react'
import { ZapReceiptEvent } from './ZapReceiptEvent'
import { ZapReceiptProfile } from './ZapReceiptProfile'

type Props = {
  event: NostrEventMetadata
}

export const ZapReceiptRoot = (props: Props) => {
  const { event } = props
  const [zap] = useState(new ZapReceipt(event))
  return <>{zap.isProfileZap ? <ZapReceiptProfile zap={zap} /> : <ZapReceiptEvent />}</>
}
