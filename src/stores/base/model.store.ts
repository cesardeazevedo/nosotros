import { makeAutoObservable, observable } from 'mobx'
import type { NostrEvent } from 'nostr-tools'
import type { Follows } from '../follows/follow'
import type { Note } from '../notes/note'
import type { Repost } from '../reposts/repost'
import type { User } from '../users/user'
import type { ZapReceipt } from '../zaps/zap.receipt.store'

class ModelStore<T extends User | Note | Follows | Repost | ZapReceipt | NostrEvent> {
  data = observable.map<string, T>()

  constructor() {
    makeAutoObservable(this)
  }

  get(id: string | undefined) {
    return this.data.get(id || '')
  }

  add(model: T) {
    this.data.set(model.id, model)
  }
}

export const modelStore = new ModelStore()
