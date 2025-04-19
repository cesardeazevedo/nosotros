import type { PublisherOptions } from '@/core/NostrPublish'
import { NostrPublisher } from '@/core/NostrPublish'
import { broadcast } from '@/core/operators/broadcast'
import { addNostrEventToStore } from '@/stores/helpers/addNostrEventToStore'
import { publishStore } from '@/stores/publish/publish.store'
import type { UnsignedEvent } from 'nostr-tools'
import { connect, EMPTY, ignoreElements, merge, mergeMap, of, shareReplay, tap, throwError } from 'rxjs'
import { getInboxRelaysFromTags } from '../observables/getInboxRelaysFromTags'
import { insert } from '../operators/insert'
import { parseEventMetadata } from '../operators/parseEventMetadata'
import { pool } from '../pool'
import { subscribeOutboxRelays } from '../subscriptions/subscribeMailbox'

export function publish(unsignedEvent: Omit<UnsignedEvent, 'created_at'>, options: PublisherOptions = {}) {
  if (!options.signer) {
    const error = 'Not authenticated'
    return throwError(() => new Error(error))
  }

  const event = {
    ...unsignedEvent,
    created_at: parseInt((Date.now() / 1000).toString()),
  }
  const ctx = { pubkey: event.pubkey }
  const pub = new NostrPublisher(event, {
    ...options,
    relays: merge(
      merge(subscribeOutboxRelays({ ...ctx, maxRelaysPerUser: 20 }), options.relays || EMPTY),
      getInboxRelaysFromTags(ctx, event),
    ),
  })

  return of(pub).pipe(
    connect((shared$) => {
      return merge(
        shared$.pipe(
          broadcast(pool),
          tap((event) => publishStore.add(event)),
          // We don't want the actual response from the relays in the main stream
          ignoreElements(),
        ),
        shared$.pipe(
          mergeMap((x) => x.signedEvent),
          insert(ctx),
          parseEventMetadata(),
          tap((event) => addNostrEventToStore(event)),
        ),
      )
    }),
    shareReplay(),
  )
}
