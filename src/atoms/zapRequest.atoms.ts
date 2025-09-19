import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'

export type ZapRequest = {
  amount: number
  custom: boolean
  comment: string
  invoice: string
}

const DEFAULT_ZAP_REQUEST: ZapRequest = {
  amount: 21,
  custom: false,
  comment: '',
  invoice: '',
}

export const zapRequestAtom = atomWithReset<ZapRequest>(DEFAULT_ZAP_REQUEST)

export const updateZapRequestAtom = atom(null, (get, set, patch: Partial<ZapRequest>) => {
  const prev = get(zapRequestAtom)
  const next = { ...prev, ...patch }
  set(zapRequestAtom, next)
})
