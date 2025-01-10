import type { ZapReceipt } from '@/stores/zaps/zap.receipt.store'

type Props = {
  zap: ZapReceipt
}

// TODO
export const ZapReceiptEvent = (props: Props) => {
  const { zap } = props
  return (
    <>
      <span></span>
    </>
  )
}
