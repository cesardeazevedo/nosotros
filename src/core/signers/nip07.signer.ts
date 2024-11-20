import type { NostrEvent, UnsignedEvent } from 'nostr-tools'
import type { Signer } from './signer'

type NostrExtension = {
  getPublicKey(): Promise<string>
  signEvent(event: UnsignedEvent): Promise<NostrEvent>
}

export class NIP07Signer implements Signer {
  constructor() {}

  async sign(event: UnsignedEvent): Promise<NostrEvent | false> {
    if ('nostr' in window) {
      const nostr = window.nostr as NostrExtension
      return await nostr.signEvent(event)
    }
    return false
  }
}
