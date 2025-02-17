import { makeAutoObservable } from 'mobx'
import type { NostrEvent } from 'nostr-tools'

export const blossomStore = makeAutoObservable({
  data: new Map<string, NostrEvent>(),

  list(pubkey: string) {
    return this.data.get(pubkey)?.tags.map((x) => x[1])
  },

  add(event: NostrEvent) {
    this.data.set(event.pubkey, event)
  },
})
