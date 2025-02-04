import type { NostrEvent, UnsignedEvent } from 'nostr-tools'

export interface Signer<T = Record<string, unknown>> {
  name: string
  options?: T
  sign(event: UnsignedEvent): Promise<NostrEvent>
  encrypt(pubkey: string, msg: string): Promise<string>
  decrypt(pubkey: string, msg: string): Promise<string>
}
