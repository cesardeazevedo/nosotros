import type { FollowsMetadata } from '@/nostr/types'
import { action, makeObservable, observable } from 'mobx'
import type { NostrEvent } from 'nostr-tools'
import { Follows } from './follow'

class FollowsStore {
  follows = observable.map<string, Follows>({}, { name: 'users' })

  constructor() {
    makeObservable(this, { add: action })
  }

  clear() {
    this.follows.clear()
  }

  get(pubkey: string) {
    return this.follows.get(pubkey)
  }

  add(event: NostrEvent, metadata: FollowsMetadata) {
    const found = this.get(event.pubkey)
    if (!found) {
      const follows = new Follows(event, metadata)
      if (!this.follows.has(event.pubkey)) {
        this.follows.set(event.pubkey, follows)
      }
      return follows
    }
    return found
  }
}

export const followsStore = new FollowsStore()
