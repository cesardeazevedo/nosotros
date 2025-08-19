import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import type { NostrContext } from '@/nostr/context'
import type { DecodeResult } from 'nostr-tools/nip19'

export const queryKeys = {
  event: (eventId: string) => ['event', eventId],
  replaceable: (kind: number, pubkey: string) => ['event', 'replaceable', pubkey, kind],
  addressable: (kind: number, pubkey: string, identifier: string) => ['event', 'addressable', pubkey, kind, identifier],
  tag: (tag: string, values: string[], kind: number) => ['events', tag, values, kind],

  nip05: (pubkey: string) => ['nip05', pubkey],
  relayInfo: (relay: string) => ['relayInfo', relay],
  relayStats: (relay: string) => ['relayStats', relay],
  relayUsers: (relay: string) => ['relayUsers', relay],
  allRelayStats: () => ['relayStats'],

  feed: (name: string, filter: NostrFilter, ctx?: NostrContext) => {
    return ['feed', name, filter.kinds, filter.search, ctx?.relays].filter(Boolean)
  },

  seen: (eventId: string) => ['seen', eventId],
}

export function pointerToQueryKey(decoded: DecodeResult | undefined) {
  switch (decoded?.type) {
    case 'note': {
      return queryKeys.event(decoded.data)
    }
    case 'nevent': {
      return queryKeys.event(decoded.data.id)
    }
    case 'naddr': {
      const { kind, pubkey, identifier } = decoded.data
      return queryKeys.addressable(kind, pubkey, identifier)
    }
    case 'npub': {
      return queryKeys.replaceable(Kind.Metadata, decoded.data)
    }
    case 'nprofile': {
      return queryKeys.replaceable(Kind.Metadata, decoded.data.pubkey)
    }
  }
  return ['noop']
}
