import type { EventTemplate, NostrEvent } from 'nostr-tools'
import type { Observable } from 'rxjs'
import { concatWith, distinct, filter, from, identity, map, mergeMap, of, shareReplay } from 'rxjs'
import { sign } from './operators/sign'
import { verify } from './operators/verify'
import type { Signer } from './signers/signer'

export type PublisherOptions = {
  signer?: Signer
  relays?: Observable<string[]>
  include?: NostrEvent[]
}

export class NostrPublisher {
  signer?: Signer
  relays: Observable<string[]>
  relayEvent: Observable<[string, NostrEvent]>
  signedEvent: Observable<NostrEvent>

  constructor(
    public event: EventTemplate | undefined,
    options: PublisherOptions,
  ) {
    this.signer = options.signer

    this.relays = options.relays || of([])

    this.signedEvent = of(event).pipe(
      filter((x) => !!x),

      sign(this.signer),

      verify(),

      shareReplay(1),
    )

    this.relayEvent = this.signedEvent.pipe(
      concatWith(from(options.include || [])),

      mergeMap((event) => {
        return this.relays.pipe(
          mergeMap(identity),
          map((relay) => [relay, event] as [string, NostrEvent]),
        )
      }),

      distinct(([relay, event]) => relay + event.id),
    )
  }
}
