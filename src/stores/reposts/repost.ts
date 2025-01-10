import type { RepostMetadata } from '@/nostr/types'
import type { NostrEvent } from 'nostr-tools'
import { noteStore } from '../notes/notes.store'

export class Repost {
  constructor(
    public event: NostrEvent,
    public meta: RepostMetadata,
  ) {}

  get id() {
    return this.event.id
  }

  get pubkey() {
    return this.event.pubkey
  }

  get ref() {
    return this.meta.mentionedNotes?.[0]
  }

  get note() {
    return noteStore.get(this.ref)!
  }
}
