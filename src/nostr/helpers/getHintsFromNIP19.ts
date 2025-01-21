import { dedupe } from '@/core/helpers/dedupe'
import type { RelayHints } from 'core/types'
import type { NAddrAttributes, NEventAttributes, NProfileAttributes } from 'nostr-editor'

export function getHintsFromNIP19(
  nevents: NEventAttributes[],
  nprofiles: NProfileAttributes[],
  naddresses: NAddrAttributes[],
) {
  const hints: Required<RelayHints> = { authors: {}, fallback: {}, ids: {} }
  for (const nevent of nevents) {
    const { id, relays } = nevent
    if (relays?.length !== 0) {
      hints.ids[id] = dedupe(hints.ids[id], relays)
    }
  }
  for (const naddress of naddresses) {
    const { kind, identifier, pubkey, relays } = naddress
    const id = `${kind}:${pubkey}:${identifier}`
    const list = dedupe(hints.ids[id], relays)
    if (list.length > 0) {
      hints.ids[id] ??= []
      hints.ids[id] = list
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
