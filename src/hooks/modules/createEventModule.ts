import { FALLBACK_RELAYS } from '@/constants/relays'
import { decodeNIP19, decodeRelays, decodeToFilter } from '@/utils/nip19'
import type { NAddr, NEvent } from 'nostr-tools/nip19'
import invariant from 'tiny-invariant'
import { pointerToQueryKey } from '../query/queryKeys'
import type { Module } from './module'

export type EventModule = Module & {
  type: 'event'
  nip19: string
}

export function createEventModule(nip19: NEvent | NAddr | string | undefined): EventModule {
  invariant(nip19, 'Invalid nip19')
  const decoded = decodeNIP19(nip19)
  const filter = decodeToFilter(decoded)!
  const relays = decodeRelays(decoded)
  return {
    id: nip19,
    queryKey: pointerToQueryKey(decoded),
    type: 'event',
    filter,
    nip19,
    ctx: {
      relays: [...relays, ...FALLBACK_RELAYS],
      relayHints: {},
    },
  }
}
