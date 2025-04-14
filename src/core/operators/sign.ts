import type { Signer } from 'core/signers/signer'
import type { EventTemplate, NostrEvent } from 'nostr-tools'
import { concatMap, filter, of, pipe } from 'rxjs'

export function sign(signer?: Signer) {
  return pipe(
    concatMap((event: EventTemplate) => (signer ? signer.sign(event) : of(false))),
    // make sure it was signed
    filter((event): event is NostrEvent => !!event),
  )
}
