import { Kind } from '@/constants/kinds'
import type { NostrEventNote, NostrEventRelayDiscovery, NostrEventRepost } from '@/nostr/types'
import { metadataSymbol, type NostrEventMetadata } from '@/nostr/types'
import { blossomStore } from '../blossom/blossom.store'
import { eventStore } from '../events/event.store'
import { followsStore } from '../follows/follows.store'
import { listStore } from '../lists/lists.store'
import { noteStore } from '../notes/notes.store'
import { reactionStore } from '../reactions/reactions.store'
import { relayDiscoveryStore } from '../relayDiscovery/relayDiscovery.store'
import { repostStore } from '../reposts/reposts.store'
import { userRelayStore } from '../userRelays/userRelay.store'
import { userStore } from '../users/users.store'
import { zapStore } from '../zaps/zaps.store'

export function addNostrEventToStore(event: NostrEventMetadata) {
  const metadata = event[metadataSymbol]
  switch (metadata.kind) {
    case Kind.Metadata: {
      userStore.add(event, metadata)
      break
    }
    case Kind.Text:
    case Kind.Article:
    case Kind.Comment: {
      eventStore.add(event as NostrEventNote)
      noteStore.add(event as NostrEventNote)
      break
    }
    case Kind.Follows: {
      followsStore.add(event, metadata)
      break
    }
    case Kind.Reaction: {
      reactionStore.add(event)
      break
    }
    case Kind.Media: {
      eventStore.add(event as NostrEventNote)
      return
    }
    case Kind.BlossomServerList: {
      blossomStore.add(event as NostrEventNote)
      return
    }
    case Kind.Repost: {
      repostStore.add(event as NostrEventRepost)
      break
    }
    case Kind.ZapReceipt: {
      eventStore.add(event as NostrEventNote)
      zapStore.add(event, metadata)
      break
    }
    case Kind.RelayList: {
      userRelayStore.add(event, metadata)
      break
    }
    case Kind.RelayDiscovery: {
      relayDiscoveryStore.add(event as NostrEventRelayDiscovery)
      break
    }
    case Kind.Mutelist: {
      listStore.add(event)
      break
    }
    default: {
      eventStore.add(event)
      break
    }
  }
}
