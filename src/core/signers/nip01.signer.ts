import { hexToBytes } from '@noble/hashes/utils'
import type { UnsignedEvent } from 'nostr-tools'
import { finalizeEvent, generateSecretKey, getPublicKey, nip44, nip04 } from 'nostr-tools'
import type { Signer } from './signer'

export class NIP01Signer implements Signer {
  name = 'nip07'

  pubkey: string
  secret: Uint8Array
  #sharedSecret = new Map<string, Uint8Array>()

  constructor(secret?: string) {
    this.secret = secret ? hexToBytes(secret) : generateSecretKey()
    this.pubkey = getPublicKey(this.secret)
  }

  #getSharedSecret(pubkey: string) {
    const cached = this.#sharedSecret.get(pubkey)
    if (cached) {
      return cached
    }
    const key = nip44.getConversationKey(this.secret, pubkey)
    this.#sharedSecret.set(pubkey, key)
    return key
  }

  async sign(event: UnsignedEvent) {
    return finalizeEvent(event, this.secret)
  }

  encrypt(pubkey: string, msg: string) {
    return Promise.resolve(nip44.v2.encrypt(msg, this.#getSharedSecret(pubkey)))
  }

  decrypt04(pubkey: string, msg: string) {
    return Promise.resolve(nip04.decrypt(this.secret, pubkey, msg))
  }

  decrypt(pubkey: string, msg: string) {
    return Promise.resolve(nip44.v2.decrypt(msg, this.#getSharedSecret(pubkey)))
  }
}
