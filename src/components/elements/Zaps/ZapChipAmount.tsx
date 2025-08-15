import { updateZapRequestAtom, zapRequestAtom } from '@/atoms/zapRequest.atoms'
import { Chip } from '@/components/ui/Chip/Chip'
import { useAtomValue, useSetAtom } from 'jotai'
import { memo } from 'react'

type Props = {
  amount: number
}

export const ZapChipAmount = memo(function ZapChipAmount(props: Props) {
  const { amount } = props
  const store = useAtomValue(zapRequestAtom)
  const updateStore = useSetAtom(updateZapRequestAtom)
  const selected = store.amount === amount && !store.custom
  return (
    <Chip selected={selected} variant='filter' label={amount} onClick={() => updateStore({ amount, custom: false })} />
  )
})
