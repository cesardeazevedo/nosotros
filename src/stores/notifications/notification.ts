import { isEventTag } from '@/nostr/helpers/parseTags'
import {
  metadataSymbol,
  type NostrEventMetadata,
  type NostrEventNote,
  type NostrEventRepost,
  type NostrEventZapReceipt,
} from '@/nostr/types'
import { makeAutoObservable } from 'mobx'
import { noteStore } from '../notes/notes.store'
import { userStore } from '../users/users.store'

export type NotificationItem =
  | {
      type: 'reply' | 'mention'
      event: NostrEventNote
    }
  | {
      type: 'reaction'
      event: NostrEventMetadata
    }
  | {
      type: 'zap'
      event: NostrEventZapReceipt
    }
  | {
      type: 'repost'
      event: NostrEventRepost
    }

export class Notification {
  constructor(public item: NotificationItem) {
    makeAutoObservable(this, {
      item: false,
    })
  }

  get type() {
    return this.item.type
  }

  get event() {
    return this.item.event
  }

  get id() {
    return this.event.id
  }

  get created_at() {
    return this.event.created_at
  }

  get author() {
    switch (this.type) {
      case 'zap': {
        return this.event.tags.find((tag) => tag[0] === 'P')?.[1] || this.event.pubkey
      }
      default: {
        return this.event.pubkey
      }
    }
  }

  get user() {
    return userStore.get(this.author)
  }

  get related() {
    const tag = this.event.tags.findLast(isEventTag)
    if (tag) {
      return noteStore.get(tag[1])
    }
  }

  get zapAmount() {
    const item = this.item
    if (item.type === 'zap') {
      return item.event[metadataSymbol].bolt11.amount?.value || '0'
    }
    return '0'
  }
}
