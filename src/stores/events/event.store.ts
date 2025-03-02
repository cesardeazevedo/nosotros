import { makeAutoObservable, observable } from 'mobx'
import type { NostrEvent } from 'nostr-tools'
import { isParameterizedReplaceableKind } from 'nostr-tools/kinds'
import { Event } from './event'

class EventStore {
  events = observable.map<string, Event>({}, { deep: false })
  addressable = observable.map<string, Event>({}, { deep: false })

  constructor() {
    makeAutoObservable(this)
  }

  clear() {
    this.events.clear()
    this.addressable.clear()
  }

  get(id: string | undefined) {
    return this.events.get(id || '')
  }

  getFromAddress(id: string | undefined) {
    return this.addressable.get(id || '')
  }

  add(nostrEvent: NostrEvent) {
    const found = this.get(nostrEvent.id)
    if (!found) {
      // @ts-ignore
      const event = new Event(nostrEvent)
      this.events.set(nostrEvent.id, event)
      if (isParameterizedReplaceableKind(nostrEvent.kind)) {
        const d = event?.tags?.d?.[0][1]
        if (d) {
          const id = `${nostrEvent.kind}:${nostrEvent.pubkey}:${d}`
          this.addressable.set(id, event)
        }
      }
      return event
    }
    return found
  }
}

export const eventStore = new EventStore()
