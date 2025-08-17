import { Kind } from '@/constants/kinds'
import { FALLBACK_RELAYS } from '@/constants/relays'
import type { NostrFilter, RelayHints } from '@/core/types'
import type { NostrEvent } from 'nostr-tools'
import { nip19 } from 'nostr-tools'
import { isParameterizedReplaceableKind } from 'nostr-tools/kinds'

export function decodeNIP19(data?: string) {
  if (data) {
    try {
      return nip19.decode(data)
    } catch {
      return undefined
    }
  }
}

export function encodeSafe<T>(callback: () => T) {
  try {
    return callback()
  } catch {
    return undefined
  }
}

export function decodeToFilter(decoded?: nip19.DecodeResult): NostrFilter | undefined {
  switch (decoded?.type) {
    case 'nprofile': {
      return { kinds: [Kind.Metadata], authors: [decoded.data.pubkey] }
    }
    case 'npub': {
      return { kinds: [Kind.Metadata], authors: [decoded.data] }
    }
    case 'nevent': {
      return { ids: [decoded.data.id] }
    }
    case 'note': {
      return { ids: [decoded.data] }
    }
    case 'naddr': {
      return { kinds: [decoded.data.kind], authors: [decoded.data.pubkey], '#d': [decoded.data.identifier] }
    }
    default: {
      return
    }
  }
}

export function decodeRelays(decoded?: nip19.DecodeResult): string[] {
  switch (decoded?.type) {
    case 'nprofile':
    case 'naddr':
    case 'nevent': {
      return decoded.data.relays || []
    }
    default: {
      return []
    }
  }
}

export function nip19ToRelayHints(decoded?: nip19.DecodeResult): RelayHints {
  switch (decoded?.type) {
    case 'npub': {
      return {
        authors: {
          [decoded.data]: FALLBACK_RELAYS,
        },
      }
    }
    case 'nprofile': {
      return {
        authors: {
          [decoded.data.pubkey]: decoded.data.relays || FALLBACK_RELAYS,
        },
      }
    }
    case 'note': {
      return {
        ids: {
          [decoded.data]: FALLBACK_RELAYS,
        },
      }
    }
    case 'nevent': {
      if (decoded.data.author) {
        return {
          idHints: {
            [decoded.data.id]: [decoded.data.author],
          },
        }
      }
      return {
        ids: {
          [decoded.data.id]: decoded.data.relays || FALLBACK_RELAYS,
        },
      }
    }
    case 'naddr': {
      const { kind, pubkey, identifier } = decoded.data
      return {
        ids: {
          [[kind, pubkey, identifier].join(':')]: decoded.data.relays || FALLBACK_RELAYS,
        },
      }
    }
    default: {
      return {}
    }
  }
}

export function eventAddress(event: NostrEvent) {
  if (isParameterizedReplaceableKind(event.kind)) {
    const dTag = getDTag(event)
    if (dTag) {
      return [event.kind, event.pubkey, dTag].join(':')
    }
  }
}

export function getDTag(event: NostrEvent) {
  return event.tags.find((tag) => tag[0] === 'd')?.[1]
}
