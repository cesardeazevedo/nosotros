import { isEventTag } from '@/nostr/helpers/parseTags'
import { makeAutoObservable } from 'mobx'
import type { NostrEvent } from 'nostr-tools'
import { noteStore } from '../notes/notes.store'

export type NotificationType = 'reply' | 'mention' | 'reaction' | 'zap' | 'repost'

export class Notification {
  constructor(
    public type: NotificationType,
    public event: NostrEvent,
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
    return this.event.pubkey
  }

  get related() {
    const tag = this.event.tags.findLast(isEventTag)
    if (tag) {
      return noteStore.get(tag[1])
    }
  }
}
