import { metadataSymbol, type NostrEventComment, type NostrEventNote } from '@/nostr/types'
import { makeAutoObservable, observable } from 'mobx'
import { isParameterizedReplaceableKind } from 'nostr-tools/kinds'
import { Event } from './event'

class EventStore {
  events = observable.map<string, Event>({}, { deep: false })
  addressable = observable.map<string, Event>({}, { deep: false })

  constructor() {
    makeAutoObservable(this)
  }

  get(id: string | undefined) {
    return this.events.get(id || '')
  }

  getFromAddress(id: string | undefined) {
    return this.addressable.get(id || '')
  }

  add(nostrEvent: NostrEventNote | NostrEventComment) {
    const event = new Event(nostrEvent)
    this.events.set(nostrEvent.id, event)
    if (isParameterizedReplaceableKind(nostrEvent.kind)) {
      const d = nostrEvent[metadataSymbol].tags.d?.[0][1]
      if (d) {
        const id = `${nostrEvent.kind}:${nostrEvent.pubkey}:${d}`
        this.addressable.set(id, event)
      }
    }
    return event
  }
}

export const eventStore = new EventStore()
