import { Kind } from '@/constants/kinds'
import { isEventTag } from '@/nostr/helpers/parseTags'
import { metadataSymbol, type NostrEventMetadata } from '@/nostr/types'
import { makeAutoObservable } from 'mobx'
import { userStore } from '../users/users.store'

export type NotificationItem = {
  type: 'reaction' | 'reply' | 'mention' | 'zap' | 'repost'
  event: NostrEventMetadata
}

export class Notification {
  constructor(public event: NostrEventMetadata) {
    makeAutoObservable(this, {
      event: false,
    })
  }

  get type() {
    switch (this.event.kind) {
      case Kind.Article:
      case Kind.Comment:
      case Kind.Text: {
        return this.event[metadataSymbol]?.isRoot ? 'mention' : 'reply'
      }
      case Kind.Reaction: {
        return 'reaction'
      }
      case Kind.Repost: {
        return 'repost'
      }
      case Kind.ZapReceipt: {
        return 'zap'
      }
    }
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
    return this.event.tags.findLast(isEventTag)?.[1]
  }

  get zapAmount() {
    if (this.type === 'zap') {
      return this.event[metadataSymbol].bolt11?.amount?.value || '0'
    }
    return '0'
  }
}
