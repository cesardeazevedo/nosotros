import { dedupe } from '@/core/helpers/dedupe'
import type { RelayHints } from 'core/types'
import type { NEventAttributes, NProfileAttributes } from 'nostr-editor'

export function getRelayHintsFromNIP19(nevents: NEventAttributes[], nprofiles: NProfileAttributes[]) {
  const hints: Required<RelayHints> = { authors: {}, fallback: {}, ids: {} }
  for (const nevent of nevents) {
    const { id, relays } = nevent
    if (relays?.length !== 0) {
      hints.ids[id] = dedupe(hints.ids[id], relays)
    }
  }
  for (const nprofile of nprofiles) {
    const { pubkey, relays } = nprofile
    const list = dedupe(hints.authors[pubkey], relays)
    if (list.length > 0) {
      hints.authors[pubkey] ??= []
      hints.authors[pubkey] = list
    }
  }
  return hints
}
