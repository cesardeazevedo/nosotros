import type { NostrEvent, UnsignedEvent } from 'nostr-tools'
import invariant from 'tiny-invariant'
import type { Signer } from './signer'

type NostrExtension = {
  getPublicKey(): Promise<string>
  signEvent(event: UnsignedEvent): Promise<NostrEvent>
  nip44: {
    encrypt(pubkey: string, msg: string): string
    decrypt(pubkey: string, msg: string): string
  }
}

const errorMsg = 'Nostr extension not detected'

export class NIP07Signer implements Signer {
  name = 'nip07'

  constructor() {}

  get nostr() {
    if ('nostr' in window) {
      return window.nostr as NostrExtension
    }
  }

  getPublicKey = async () => {
    invariant(this.nostr, errorMsg)
    return await this.nostr.getPublicKey()
  }

  sign = async (event: UnsignedEvent) => {
    invariant(this.nostr, errorMsg)
    return await this.nostr.signEvent(event)
  }

  encrypt = (pubkey: string, msg: string) => {
    invariant(this.nostr, errorMsg)
    return Promise.resolve(this.nostr.nip44.decrypt(pubkey, msg))
  }

  decrypt = (pubkey: string, msg: string) => {
    invariant(this.nostr, errorMsg)
    return Promise.resolve(this.nostr.nip44.decrypt(pubkey, msg))
  }
}
