import { Kind } from '@/constants/kinds'
import { makeAutoObservable } from 'mobx'
import type { NostrEvent } from 'nostr-tools'

export const listStore = makeAutoObservable({
  muteP: new Map<string, Set<string>>(),
  muteT: new Map<string, Set<string>>(),
  muteE: new Map<string, Set<string>>(),
  muteWord: new Map<string, Set<string>>(),

  bookmarkE: new Map<string, Set<string>>(),
  bookmarkA: new Map<string, Set<string>>(),

  communities: new Map<string, Set<string>>(),

  append(data: Map<string, Set<string>>, pubkey: string, value: string) {
    data.set(pubkey, data.get(pubkey)?.add(value) || new Set([value]))
  },

  add(event: NostrEvent) {
    switch (event.kind) {
      case Kind.Mutelist: {
        event.tags.forEach(([tag, value]) => {
          switch (tag) {
            case 'p': {
              this.append(this.muteP, event.pubkey, value)
              break
            }
            case 't': {
              this.append(this.muteT, event.pubkey, value)
              break
            }
            case 'e': {
              this.append(this.muteE, event.pubkey, value)
              break
            }
            case 'word': {
              this.append(this.muteWord, event.pubkey, value)
              break
            }
          }
        })
        break
      }
      default: {
        // todo
        break
      }
    }
  },
})
