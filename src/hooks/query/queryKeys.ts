import { Kind } from '@/constants/kinds'
import type { NostrFilter } from '@/core/types'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { NostrContext } from '@/nostr/context'
import { getDTag } from '@/utils/nip19'
import { isAddressableKind, isReplaceableKind } from 'nostr-tools/kinds'
import type { DecodedResult } from 'nostr-tools/nip19'

export const queryKeys = {
  event: (eventId: string) => ['event', eventId],
  replaceable: (kind: number, pubkey: string) => ['event', 'replaceable', pubkey, kind],
  addressable: (kind: number, pubkey: string, identifier: string) => ['event', 'addressable', pubkey, kind, identifier],
  author: (pubkey: string, kind: number) => ['events', 'author', pubkey, kind],
  tag: (tag: string, values: string[], kind: number) => ['events', tag, values, kind],

  nip05: (pubkey: string) => ['nip05', pubkey],
  relayInfo: (relay: string) => ['relayInfo', relay],
  relayStats: (relay: string) => ['relayStats', relay],
  relayUsers: (relay: string) => ['relayUsers', relay],
  allRelayStats: () => ['relayStats'],

  feed: (name: string, filter: NostrFilter, ctx?: NostrContext) => {
    return ['feed', name, filter.kinds, filter.search, filter['#t'], ctx?.relays].filter(Boolean)
  },

  seen: (eventId: string) => ['seen', eventId],
}

export function pointerToQueryKey(decoded: DecodedResult | undefined) {
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

export function eventToQueryKey(event: NostrEventDB) {
  if (isReplaceableKind(event.kind)) {
    return queryKeys.replaceable(event.kind, event.pubkey)
  } else if (isAddressableKind(event.kind)) {
    const dTag = getDTag(event)
    if (dTag) {
      return queryKeys.addressable(event.kind, event.pubkey, dTag)
    }
  } else {
    return queryKeys.event(event.id)
  }
}

export function eventIdToQueryKey(id: string) {
  if (!id.includes(':')) {
    return queryKeys.event(id)
  } else {
    const parts = id.split(':')
    if (parts.length === 3) {
      const [kind, pubkey, identifier] = id.split(':')
      return queryKeys.addressable(parseInt(kind), pubkey, identifier)
    } else {
      // shouldn't really happen
      const [kind, pubkey] = id.split(':')
      return queryKeys.replaceable(parseInt(kind), pubkey)
    }
  }
}
