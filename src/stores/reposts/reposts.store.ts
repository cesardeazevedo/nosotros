import type { NostrEventRepost } from '@/nostr/types'
import { metadataSymbol } from '@/nostr/types'
import type { ObservableSet } from 'mobx'
import { makeAutoObservable, observable } from 'mobx'

export const repostStore = makeAutoObservable({
  repostsByNote: new Map<string, ObservableSet<string>>(),
  repostsByPubkey: new Map<string, ObservableSet<string>>(),

  clear() {
    this.repostsByNote.clear()
  },

  getByPubkey(pubkey?: string) {
    return this.repostsByPubkey.get(pubkey || '')
  },

  add(event: NostrEventRepost) {
    const ref = event[metadataSymbol].mentionedNotes[0]
    const acc = this.repostsByNote.get(ref)
    if (acc) {
      acc.add(event.id)
    } else {
      this.repostsByNote.set(ref, observable.set([event.id]))
    }

    const pubkeyRepost = this.repostsByPubkey.get(event.pubkey)
    if (!pubkeyRepost) {
      this.repostsByPubkey.set(event.pubkey, observable.set([ref]))
    } else {
      pubkeyRepost.add(ref)
    }
  },
})
