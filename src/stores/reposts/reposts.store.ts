import type { RepostMetadata } from '@/nostr/types'
import type { ObservableSet } from 'mobx'
import { makeAutoObservable, observable } from 'mobx'
import type { NostrEvent } from 'nostr-tools'
import { Repost } from './repost'

export const repostStore = makeAutoObservable({
  reposts: new Map<string, Repost>(),
  repostsByNote: new Map<string, ObservableSet<string>>(),
  repostsByPubkey: new Map<string, ObservableSet<string>>(),

  clear() {
    this.reposts.clear()
    this.repostsByNote.clear()
  },

  get(id: string) {
    return this.reposts.get(id)
  },

  getByPubkey(pubkey?: string) {
    return this.repostsByPubkey.get(pubkey || '')
  },

  add(event: NostrEvent, metadata: RepostMetadata) {
    const found = this.reposts.get(event.id)
    if (!found) {
      const repost = new Repost(event, metadata)
      this.reposts.set(event.id, repost)
      const acc = this.repostsByNote.get(repost.ref)
      if (acc) {
        acc.add(event.id)
      } else {
        this.repostsByNote.set(repost.ref, observable.set([event.id]))
      }

      const pubkeyRepost = this.repostsByPubkey.get(event.pubkey)
      if (!pubkeyRepost) {
        this.repostsByPubkey.set(event.pubkey, observable.set([repost.ref]))
      } else {
        pubkeyRepost.add(repost.ref)
      }

      return repost
    }
    return found
  },
})
