import type { ZapReceiptMetadata } from '@/nostr/helpers/parseZap'
import type { ObservableMap, ObservableSet } from 'mobx'
import { makeAutoObservable, observable, values } from 'mobx'
import type { NostrEvent } from 'nostr-tools'
import { ZapReceipt } from './zap.receipt.store'

export class ZapStore {
  zaps = observable.map<string, ZapReceipt>({}, { deep: false })
  zapsByEvent = observable.map<string, ObservableMap<string, ZapReceipt>>({}, { deep: false })
  zapsByPubkey = observable.map<string, ObservableSet<string>>({}, { deep: false })

  constructor() {
    makeAutoObservable(this)
  }

  get(id: string) {
    return this.zaps.get(id)
  }

  getTotal(noteId: string) {
    const zaps = this.zapsByEvent.get(noteId)
    if (zaps) {
      const z = values(zaps)
        .flatMap((x) => x.metadata.bolt11)
        .reduce((acc, current) => {
          const amount = parseInt(current?.amount?.value || '0')
          return acc + amount
        }, 0)
      return z / 1000
    }
    return 0
  }

  add(event: NostrEvent, metadata: ZapReceiptMetadata) {
    const zapId = event.id
    const found = this.zaps.get(zapId)
    if (!found) {
      const receipt = new ZapReceipt(event, metadata)
      this.zaps.set(zapId, receipt)

      const { receiverEvent, receiverProfile, zapper } = receipt

      if (receiverEvent) {
        const eventZap = this.zapsByEvent.get(receiverEvent)
        if (!eventZap) {
          this.zapsByEvent.set(receiverEvent, observable.map([[zapId, receipt]]))
        } else {
          eventZap.set(event.id, receipt)
        }

        if (zapper) {
          const pubkeyZap = this.zapsByPubkey.get(zapper)
          if (!pubkeyZap) {
            this.zapsByPubkey.set(zapper, observable.set([receiverEvent]))
          } else {
            pubkeyZap.add(receiverEvent)
          }
        } else {
          // anonymous zap
        }
      } else if (receiverProfile) {
        // TODO: profile zap
      }
      return receipt
    }
    return found
  }
}

export const zapStore = new ZapStore()
