import type { ZapReceiptMetadata } from '@/nostr/helpers/parseZap'
import type { NostrEvent } from 'nostr-tools'

export class ZapReceipt {
  constructor(
    public event: NostrEvent,
    public metadata: ZapReceiptMetadata,
  ) {}

  get id() {
    return this.event.id
  }

  get amount() {
    return this.metadata.bolt11.amount?.value || 0
  }
  // sender
  get zapper() {
    return this.metadata.zapper
  }

  get receiverProfile() {
    return this.metadata.receiver
  }

  get receiverEvent() {
    return this.metadata.receiverEvent
  }

  get isAnonymous() {
    return !this.zapper
  }

  get isProfileZap() {
    return !this.receiverEvent
  }
}
