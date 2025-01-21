import { isEventTag } from '@/nostr/helpers/parseTags'
import type { NostrEventMetadata } from '@/nostr/types'
import { makeAutoObservable } from 'mobx'
import { noteStore } from '../notes/notes.store'

export type NotificationType = 'reply' | 'mention' | 'reaction' | 'zap' | 'repost'

export class Notification {
  constructor(
    public type: NotificationType,
    public event: NostrEventMetadata,
  ) {
    makeAutoObservable(this, {
      type: false,
      event: false,
    })
  }

  get id() {
    return this.event.id
  }

  get created_at() {
    return this.event.created_at
  }

  get pubkey() {
    switch (this.type) {
      case 'zap': {
        return this.event.tags.find((tag) => tag[0] === 'P')?.[1]
      }
      default: {
        return this.event.pubkey
      }
    }
  }

  get related() {
    const tag = this.event.tags.findLast(isEventTag)
    if (tag) {
      return noteStore.get(tag[1])
    }
  }
}
