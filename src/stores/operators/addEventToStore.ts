import { Kind } from "constants/kinds"
import type { NostrEvent } from "core/types"
import { cache, cacheRelayList } from "nostr/cache"
import type { UserDB } from "nostr/types"
import { reactionStore } from "stores/nostr/reactions.store"
import { userStore } from "stores/nostr/users.store"

export function addEventToStore(event: NostrEvent) {
  switch (event.kind) {
    case Kind.Metadata: {
      userStore.add(event as UserDB)
      break
    }
    // case Kind.Text:
    // case Kind.Article: {
    //   noteStore.add(event as NoteDB, client)
    //   break
    // }
    // case Kind.Follows: {
    //   followsStore.add(event)
    //   break
    // }
    case Kind.Reaction: {
      cache.set(event.id, true)
      reactionStore.add(event)
      break
    }
    case Kind.RelayList: {
      cacheRelayList.set(event.pubkey, true)
      break
    }
    default: {
      console.log('Unhandled Event Kind', event.id, event.kind)
      cache.set(event.id, true)
      break
    }
  }
}

