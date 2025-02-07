import type { PublisherOptions } from '@/core/NostrPublish'
import { NostrPublisher } from '@/core/NostrPublish'
import { broadcast } from '@/core/operators/broadcast'
import type { EventTemplate } from 'nostr-tools'
import { connect, EMPTY, ignoreElements, merge, mergeMap, of, shareReplay, tap, throwError } from 'rxjs'
import type { NostrClient } from '../nostr'
import { parseEventMetadata } from '../operators/parseEventMetadata'
import { insert } from '../operators/insert'

export function publish(
  client: NostrClient,
  unsignedEvent: Omit<EventTemplate, 'created_at'>,
  options: PublisherOptions = {},
) {
  if (!client.pubkey || !client.signer) {
    const error = 'Not authenticated'
    return throwError(() => new Error(error))
  }

  const event = {
    ...unsignedEvent,
    pubkey: client.pubkey,
    created_at: parseInt((Date.now() / 1000).toString()),
  }
  const pub = new NostrPublisher(event, {
    ...options,
    signer: client.signer,
    relays: options.relays || client.outbox$,
    inbox: !options.relays ? client.inboxTracker.subscribe.bind(client.inboxTracker) : () => EMPTY,
  })

  return of(pub).pipe(
    connect((shared$) => {
      return merge(
        shared$.pipe(
          broadcast(client.pool),
          tap(client.options.onPublish),
          // We don't want the actual response from the relays in the main stream
          ignoreElements(),
        ),
        shared$.pipe(
          mergeMap((x) => x.signedEvent),
          insert(client),
          parseEventMetadata(),
          tap(client.options.onEvent),
        ),
      )
    }),
    shareReplay(),
  )
}
