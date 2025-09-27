import { Kind } from '@/constants/kinds'
import { dedupe } from '@/core/helpers/dedupe'
import type { RelayHints } from '@/core/types'
import type { NAddrAttributes, NEventAttributes, NProfileAttributes } from 'nostr-editor'
import type { NostrEvent } from 'nostr-tools'

function appendHint(hints: RelayHints, field: keyof RelayHints, key: string, value: string) {
  if (value) {
    hints[field] ??= {}
    hints[field][key] ??= []
    if (hints[field][key].indexOf(value) === -1) {
      hints[field][key].push(value)
    }
  }
}

export function parseRelayHintsFromTags(event: NostrEvent) {
  const hints = {} as RelayHints
  event.tags.forEach((tag) => {
    const [name, value, relay] = tag
    switch (name) {
      case 'P':
      case 'p': {
        appendHint(hints, 'authors', value, relay)
        break
      }
      case 'q': {
        const pubkeyHint = tag[3]
        appendHint(hints, 'ids', value, relay)
        if (pubkeyHint) {
          appendHint(hints, 'idHints', value, pubkeyHint)
        }
        break
      }
      case 'E':
      case 'e': {
        appendHint(hints, 'ids', value, relay)
        const pubkeyHint = tag[event.kind === Kind.Text ? 4 : 3]
        if (pubkeyHint) {
          appendHint(hints, 'idHints', value, pubkeyHint)
        }
        break
      }
      default: {
        break
      }
    }
  })
  return hints
}

export function parseRelayHintsFromNIP19(
  nevents: NEventAttributes[],
  nprofiles: NProfileAttributes[],
  naddresses: NAddrAttributes[],
) {
  const hints: Required<RelayHints> = { authors: {}, idHints: {}, ids: {} }
  for (const nevent of nevents) {
    const { id, author, relays } = nevent
    if (relays?.length !== 0) {
      hints.ids[id] = dedupe(hints.ids[id], relays)
    } else if (author) {
      hints.idHints[id] = dedupe(hints.idHints[id], [author])
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
