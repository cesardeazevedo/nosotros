import type { NostrEvent, UnsignedEvent } from 'nostr-tools'
import type { Observable } from 'rxjs'
import { concatWith, distinct, EMPTY, filter, from, identity, map, mergeMap, mergeWith, of, tap } from 'rxjs'
import { sign } from './operators/sign'
import { verify } from './operators/verify'
import type { Signer } from './signers/signer'

export type PublisherOptions = {
  signer?: Signer
  relays?: Observable<string[]>
  include?: NostrEvent[]
  onSigned?: (event: NostrEvent) => void
  inbox?: (event: NostrEvent) => Observable<string[]>
}

export class NostrPublisher {
  signer?: Signer
  relays: Observable<string[]>
  relayEvent: Observable<[string, NostrEvent]>

  constructor(
    public event: UnsignedEvent | undefined,
    options: PublisherOptions,
  ) {
    this.signer = options.signer

    this.relays = options.relays || of([])

    this.relayEvent = of(event).pipe(
      filter((x) => !!x),

      sign(this.signer),

      verify(),

      tap((event) => options?.onSigned?.(event)),

      concatWith(from(options.include || [])),

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
