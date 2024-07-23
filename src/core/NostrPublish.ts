import type { NostrEvent, UnsignedEvent } from 'nostr-tools'
import type { Observable } from 'rxjs'
import { concatWith, distinct, EMPTY, identity, map, mergeMap, mergeWith, of, tap } from 'rxjs'
import { sign } from './operators/sign'
import { verify } from './operators/verify'
import type { Signer } from './signers/signer'

export type RelayEvent = [string, NostrEvent]

export type PublisherOptions = {
  signer?: Signer
  relays?: Observable<string[]>
  include?: Observable<[NostrEvent]>
  onSigned?: (event: NostrEvent) => void
  inbox?: (event: NostrEvent) => Observable<string[]>
  seen?: string[]
}

export class NostrPublisher {
  signer?: Signer
  relays: Observable<string[]>
  relayEvent: Observable<[string, NostrEvent]>

  constructor(
    public event: UnsignedEvent,
    options: PublisherOptions,
  ) {
    this.signer = options.signer

    this.relays = options.relays || of([])

    this.relayEvent = of(event).pipe(
      sign(this.signer),

      verify(),

      tap((event) => options?.onSigned?.(event)),

      concatWith(options.include?.pipe(mergeMap(identity)) || EMPTY),

      mergeMap((event) => {
        return this.relays.pipe(
          mergeWith(options.inbox?.(event) || EMPTY),
          mergeMap(identity),
          map((relay) => [relay, event] as [string, NostrEvent]),
        )
      }),

      distinct(([relay, event]) => relay + event.id),
    )
  }
}
