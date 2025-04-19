import { Kind } from '@/constants/kinds'
import { type NostrEventMetadata } from '@/nostr/types'
import type { NostrEvent } from 'nostr-tools'
import { eventStore } from '../events/event.store'
import { userStore } from '../users/users.store'

export function addNostrEventToStore(event: NostrEvent | NostrEventMetadata) {
  switch (event.kind) {
    case Kind.Metadata: {
      // todo: move userStore to eventStore
      userStore.add(event as NostrEventMetadata)
      break
    }
    default: {
      eventStore.add(event)
      break
    }
  }
}
