import { metadataSymbol, type NostrEventMetadata } from '@/nostr/types'

export class ZapReceipt {
  constructor(public event: NostrEventMetadata) {}

  get id() {
    return this.event.id
  }

  get metadata() {
    return this.event[metadataSymbol]
  }

  get tags() {
    return this.metadata.tags || {}
  }

  get amount() {
    return this.metadata.bolt11?.amount?.value || 0
  }
  // sender
  get zapper() {
    return this.tags.P?.[0][1]
  }

  get receiverProfile() {
    return this.tags.p?.[0][1]
  }

  get receiverEvent() {
    return this.tags.e?.[0][1]
  }

  get isAnonymous() {
    return !this.zapper
  }

  get isProfileZap() {
    return !this.receiverEvent
  }
}
