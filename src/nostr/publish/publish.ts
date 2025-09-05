import { addPublishAtom } from '@/atoms/publish.atoms'
import { store } from '@/atoms/store'
import type { PublisherOptions } from '@/core/NostrPublish'
import { NostrPublisher } from '@/core/NostrPublish'
import { broadcast } from '@/core/operators/broadcast'
import { setEventData } from '@/hooks/query/queryUtils'
import { setSeenData } from '@/hooks/query/useSeen'
import { subscribeEventRelays } from '@/hooks/subscriptions/subscribeOutbox'
import type { UnsignedEvent } from 'nostr-tools'
import { connect, ignoreElements, map, merge, mergeMap, of, shareReplay, take, tap, throwError } from 'rxjs'
import { parseEventMetadata } from '../../hooks/parsers/parseEventMetadata'
import { dbSqlite } from '../db'
import { pool } from '../pool'

export type LocalPublisherOptions = Omit<PublisherOptions, 'relays'> & {
  relays?: string[]
  includeRelays?: string[]
}

export function publish(unsignedEvent: Omit<UnsignedEvent, 'created_at'>, options: LocalPublisherOptions = {}) {
  if (!options.signer) {
    const error = 'Not authenticated'
    return throwError(() => new Error(error))
  }

  const event = {
    ...unsignedEvent,
    created_at: parseInt((Date.now() / 1000).toString()),
  }

  const pub = new NostrPublisher(event, {
    ...options,
    relays: merge(
      options.relays ? of(options.relays) : subscribeEventRelays(event, { maxRelaysPerUser: 20 }),
      of(options.includeRelays || []),
    ),
  })

  return of(pub).pipe(
    connect((shared$) => {
      return merge(
        shared$.pipe(
          broadcast(pool),
          tap((res) => store.set(addPublishAtom, res)),
          tap(([relay, , status, , event]) => {
            if (status) {
              dbSqlite.insertSeen(relay, event)
              setSeenData(event.id, relay)
            }
          }),
          take(1),
          tap(([, , , , event]) => dbSqlite.insertEvent(event)),
          // We don't want the actual response from the relays in the main stream
          ignoreElements(),
        ),
        shared$.pipe(
          mergeMap((x) => x.signedEvent),
          map(parseEventMetadata),
          tap(setEventData),
        ),
      )
    }),
    shareReplay(),
  )
}
