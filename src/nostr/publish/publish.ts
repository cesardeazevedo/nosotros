import type { PublisherOptions } from '@/core/NostrPublish'
import { NostrPublisher } from '@/core/NostrPublish'
import { broadcast } from '@/core/operators/broadcast'
import type { EventTemplate } from 'nostr-tools'
import { connect, EMPTY, ignoreElements, merge, mergeMap, of, shareReplay, tap, throwError } from 'rxjs'
import type { NostrContext } from '../context'
import { insert } from '../operators/insert'
import { parseEventMetadata } from '../operators/parseEventMetadata'
import { trackInbox } from '../operators/trackInbox'
import { pool } from '../pool'

export function publish(
  ctx: NostrContext,
  unsignedEvent: Omit<EventTemplate, 'created_at'>,
  options: PublisherOptions = {},
) {
  const { signer, pubkey } = ctx
  if (!pubkey || !signer) {
    const error = 'Not authenticated'
    return throwError(() => new Error(error))
  }

  const event = {
    ...unsignedEvent,
    pubkey,
    created_at: parseInt((Date.now() / 1000).toString()),
  }
  const pub = new NostrPublisher(event, {
    ...options,
    signer,
    relays: options.relays || ctx.outbox$,
    inbox: !options.relays ? (event) => trackInbox(ctx, event) : () => EMPTY,
  })

  return of(pub).pipe(
    connect((shared$) => {
      return merge(
        shared$.pipe(
          broadcast(pool),
          tap(ctx.onPublish),
          // We don't want the actual response from the relays in the main stream
          ignoreElements(),
        ),
        shared$.pipe(
          mergeMap((x) => x.signedEvent),
          insert(ctx),
          parseEventMetadata(),
          tap(ctx.onEvent),
        ),
      )
    }),
    shareReplay(),
  )
}
