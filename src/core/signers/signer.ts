import type { NostrEvent, UnsignedEvent } from 'nostr-tools'

export interface Signer {
  sign(event: UnsignedEvent): Promise<NostrEvent | UnsignedEvent>
}
