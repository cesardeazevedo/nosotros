import { Kind } from '@/constants/kinds'
import type { NostrEventRelayDiscovery } from '@/nostr/types'
import { metadataSymbol, type NostrEventMetadata } from '@/nostr/types'
import { modelStore } from '../base/model.store'
import { followsStore } from '../follows/follows.store'
import { noteStore } from '../notes/notes.store'
import { reactionStore } from '../reactions/reactions.store'
import { relayDiscoveryStore } from '../relayDiscovery/relayDiscovery.store'
import { repostStore } from '../reposts/reposts.store'
import { userRelayStore } from '../userRelays/userRelay.store'
import { userStore } from '../users/users.store'
import { zapStore } from '../zaps/zaps.store'
import { listStore } from '../lists/lists.store'
import { commentStore } from '../comment/comment.store'

export function addNostrEventToStore(event: NostrEventMetadata) {
  const metadata = event[metadataSymbol]
  switch (metadata.kind) {
    case Kind.Metadata: {
      modelStore.add(userStore.add(event, metadata))
      break
    }
    case Kind.Text:
    case Kind.Article: {
      modelStore.add(noteStore.add(event, metadata))
      break
    }
    case Kind.Follows: {
      modelStore.add(followsStore.add(event, metadata))
      break
    }
    case Kind.Reaction: {
      modelStore.add(reactionStore.add(event))
      break
    }
    case Kind.Repost: {
      modelStore.add(repostStore.add(event, metadata))
      break
    }
    case Kind.Comment: {
      modelStore.add(commentStore.add(event, metadata))
      break
    }
    case Kind.ZapReceipt: {
      modelStore.add(zapStore.add(event, metadata))
      break
    }
    case Kind.RelayList: {
      userRelayStore.add(event, metadata)
      break
    }
    case Kind.RelayDiscovery: {
      modelStore.add(relayDiscoveryStore.add(event as NostrEventRelayDiscovery))
      break
    }
    case Kind.Mutelist: {
      listStore.add(event)
      break
    }
    default: {
      modelStore.add(event)
      break
    }
  }
}
