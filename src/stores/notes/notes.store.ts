import type { NostrEventComment, NostrEventNote } from '@/nostr/types'
import { metadataSymbol } from '@/nostr/types'
import { dedupe } from 'core/helpers/dedupe'
import { makeAutoObservable } from 'mobx'
import type { Event } from '../events/event'
import { eventStore } from '../events/event.store'

export class NoteStore {
  replies = new Map<string, string[]>()
  addresses = new Map<string, string[]>()

  constructor() {
    makeAutoObservable(this)
  }

  clear() {
    this.replies.clear()
    this.addresses.clear()
  }

  getReplies(event: Event) {
    const replies = this.replies.get(event.id) || []
    const repliesAddressable = event.isAddressable ? this.addresses.get(event.address || '') || [] : []
    return [...replies, ...repliesAddressable].map((x) => eventStore.get(x)).filter((x) => !!x)
  }

  // Add NIP-10 replies or NIP-22 comments
  add(event: NostrEventNote | NostrEventComment) {
    const metadata = event[metadataSymbol]
    const parentId = metadata.parentId
    if (parentId) {
      const isAddressable = parentId.includes(':')
      if (isAddressable) {
        this.addresses.set(parentId, dedupe(this.addresses.get(parentId), [event.id]))
      } else {
        this.replies.set(parentId, dedupe(this.replies.get(parentId), [event.id]))
      }
    }
  }
}

export const noteStore = new NoteStore()
