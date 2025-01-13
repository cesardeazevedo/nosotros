import { makeAutoObservable, observable } from 'mobx'
import type { NostrEvent } from 'nostr-tools'
import { isParameterizedReplaceableKind } from 'nostr-tools/kinds'
import type { Follows } from '../follows/follow'
import type { Note } from '../notes/note'
import type { Repost } from '../reposts/repost'
import type { User } from '../users/user'
import type { ZapReceipt } from '../zaps/zap.receipt.store'

class ModelStore<T extends User | Note | Follows | Repost | ZapReceipt | NostrEvent> {
  data = observable.map<string, T>({}, { deep: false })
  addressable = observable.map<string, T>({}, { deep: false })

  constructor() {
    makeAutoObservable(this)
  }

  get(id: string | undefined) {
    return this.data.get(id || '')
  }

  getEvent(id: string | undefined): NostrEvent | undefined {
    const item = this.data.get(id || '')
    if (item) {
      return 'event' in item ? item.event : item
    }
  }

  getAddressable(id: string | undefined) {
    return this.addressable.get(id || '')
  }

  add(model: T) {
    this.data.set(model.id, model)
    this.addAddressable(model)
  }

  private addAddressable(model: T) {
    const event = 'event' in model ? model.event : (model as NostrEvent)
    if (isParameterizedReplaceableKind(event.kind)) {
      const d = event.tags.find((x) => x[0] === 'd')?.[1]
      if (d) {
        const id = `${event.kind}:${event.pubkey}:${d}`
        this.addressable.set(id, model)
      }
    }
  }
}

export const modelStore = new ModelStore()
