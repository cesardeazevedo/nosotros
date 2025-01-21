import type { ZapReceipt } from '@/stores/zaps/zap.receipt.store'
import { ZapReceiptProfile } from './ZapReceiptProfile'
import { ZapReceiptEvent } from './ZapReceiptEvent'

type Props = {
  zap: ZapReceipt
}

export const ZapReceiptRoot = (props: Props) => {
  const { zap } = props
  return <>{zap.isProfileZap ? <ZapReceiptProfile zap={zap} /> : <ZapReceiptEvent />}</>
}
