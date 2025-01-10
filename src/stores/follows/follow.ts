import type { FollowsMetadata } from '@/nostr/helpers/parseFollowList'
import type { NostrEvent } from 'core/types'

export class Follows {
  event: NostrEvent
  tags = new Map<string, Set<string>>()

  constructor(event: NostrEvent, metadata: FollowsMetadata) {
    this.event = event
    this.tags = metadata.tags
  }

  get id() {
    return this.event.id
  }

  get pubkey() {
    return this.event.pubkey
  }

  followsPubkey(pubkey?: string) {
    return this.tags.get('p')?.has(pubkey || '')
  }
}
