import { Chip } from '@/components/ui/Chip/Chip'
import type { ZapRequestStore } from '@/stores/zaps/zap.request.store'
import { observer } from 'mobx-react-lite'

type Props = {
  amount: number
  store: ZapRequestStore
}

export const ZapChipAmount = observer(function ZapChipAmount(props: Props) {
  const { amount, store } = props
  const selected = store.amount === amount && !store.custom.value
  return <Chip selected={selected} variant='filter' label={amount} onClick={() => store.setAmount(amount)} />
})
