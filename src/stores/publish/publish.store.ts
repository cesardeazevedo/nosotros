import type { BroadcastResponse } from '@/core/operators/broadcast'
import { encodeSafe } from '@/utils/nip19'
import { makeAutoObservable, observable } from 'mobx'
import { nip19, type NostrEvent } from 'nostr-tools'
import { isParameterizedReplaceableKind } from 'nostr-tools/kinds'

export type PublishedEvent = {
  relay: string
  eventId: string
  status: boolean
  msg: string
  event: NostrEvent
}

export class Publish {
  data: PublishedEvent[]

  constructor(data: PublishedEvent[]) {
    this.data = data
    makeAutoObservable({ data: false })
  }

  get length() {
    return this.data.length
  }

  get totalSuccess() {
    return this.data.filter((x) => x.status).length
  }
}

export const publishStore = makeAutoObservable({
  publishes: observable.map<string, PublishedEvent[]>(),

  get(id: string): PublishedEvent[] {
    return this.publishes.get(id || '') || []
  },

  successes(id: string) {
    return this.get(id).filter((x) => x.status)
  },

  failures(id: string) {
    return this.get(id).filter((x) => !x.status)
  },

  nip19(event: NostrEvent) {
    const relays = this.get(event.id).map((x) => x.relay)
    return encodeSafe(() => {
      const identifier = event.tags.find((x) => x[0] === 'd')?.[1]
      if (isParameterizedReplaceableKind(event.kind) && identifier) {
        return nip19.naddrEncode({
          kind: event.kind,
          pubkey: event.pubkey,
          relays,
          identifier,
        })
      } else {
        return nip19.neventEncode({
          id: event.id,
          kind: event.kind,
          author: event.pubkey,
          relays,
        })
      }
    })
  },

  add([relay, eventId, status, msg, event]: BroadcastResponse) {
    const found = this.publishes.get(eventId)
    if (found) {
      found.push({ relay, eventId, status, msg, event })
      return
    }
    this.publishes.set(eventId, [{ relay, eventId, status, msg, event }])
  },
})
