import { Kind } from 'constants/kinds'
import type { NostrEvent } from 'core/types'
import { cache, cacheRelayList } from 'nostr/cache'
import { followsStore } from 'stores/nostr/follows.store'
import { noteStore } from 'stores/nostr/notes.store'
import { userStore } from 'stores/nostr/users.store'

export function hasEventInStore(event: NostrEvent) {
  switch (event.kind) {
    case Kind.Metadata: {
      return userStore.users.has(event.pubkey)
    }
    case Kind.Text:
    case Kind.Article: {
      return noteStore.notes.has(event.id)
    }
    case Kind.Follows: {
      const found = followsStore.follows.get(event.pubkey)
      return found && found.created_at > event.created_at
    }
    case Kind.RelayList: {
      return cacheRelayList.has(event.pubkey)
    }
    default: {
      return cache.has(event.id)
    }
  }
}
