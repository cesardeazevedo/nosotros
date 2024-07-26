import type { Signer } from 'core/signers/signer'
import type { UnsignedEvent } from 'nostr-tools'
import { concatMap, of } from 'rxjs'

export function sign(signer?: Signer) {
  return concatMap((event: UnsignedEvent) => (signer ? signer.sign(event) : of(event)))
}
