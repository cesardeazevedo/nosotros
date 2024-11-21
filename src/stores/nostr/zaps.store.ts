import type { ObservableMap } from 'mobx'
import { makeAutoObservable, observable, values } from 'mobx'
import type { NostrEvent } from 'nostr-tools'
import { isEventTag } from '@/nostr/helpers/parseTags'
import type { ZapMetadataDB } from 'nostr/types'

export type ZapItem = {
  id: string
  pubkey: string
  bolt11: ZapMetadataDB['bolt11']
}

export class ZapStore {
  zaps = observable.map<string, ObservableMap<string, ZapItem>>({}, { deep: true })

  constructor() {
    makeAutoObservable(this)
  }

  getTotal(noteId: string) {
    const zaps = this.zaps.get(noteId)
    if (zaps) {
      const z = values(zaps)
        .flatMap((x) => x.bolt11)
        .reduce((acc, current) => {
          const amount = parseInt(current.amount?.value || '0')
          return acc + amount
        }, 0)
      return z / 1000
    }
    return 0
  }

  add(event: NostrEvent, metadata: ZapMetadataDB) {
    const eventTag = event.tags.find((tag) => isEventTag(tag))
    if (eventTag) {
      const eventId = eventTag[1]
      const eventZap = this.zaps.get(eventId)
      const data: ZapItem = {
        id: event.id,
        pubkey: event.pubkey,
        bolt11: metadata.bolt11,
      }
      if (!eventZap) {
        this.zaps.set(eventId, observable.map([[event.id, data]]))
      } else {
        eventZap.set(event.id, data)
      }
    } else {
      // TODO: profile zap
    }
  }
}

export const zapStore = new ZapStore()
