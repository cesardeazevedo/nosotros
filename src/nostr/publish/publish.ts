import { addPublishAtom, resetPublishEventRelayAtom } from '@/atoms/publish.atoms'
import { store } from '@/atoms/store'
import type { PublisherOptions } from '@/core/NostrPublish'
import { NostrPublisher } from '@/core/NostrPublish'
import { createAuthenticator } from '@/core/observable/createAuthenticator'
import { broadcast } from '@/core/operators/broadcast'
import { RelayToClient } from '@/core/types'
import { setEventData } from '@/hooks/query/queryUtils'
import { setSeenData } from '@/hooks/query/useSeen'
import { subscribeEventRelays } from '@/hooks/subscriptions/subscribeOutbox'
import type { NostrEvent, UnsignedEvent } from 'nostr-tools'
import { connect, EMPTY, endWith, ignoreElements, map, merge, mergeMap, of, shareReplay, takeUntil, tap } from 'rxjs'
import { parseEventMetadata } from '../../hooks/parsers/parseEventMetadata'
import { dbSqlite } from '../db'
import { pool } from '../pool'

export type LocalPublisherOptions = Omit<PublisherOptions, 'relays'> & {
  relays?: string[]
  includeRelays?: string[]
  saveEvent?: boolean
}

export function signAndSave(unsignedEvent: Omit<UnsignedEvent, 'created_at'>, options: LocalPublisherOptions) {
  if (!options.signer) {
    throw new Error('Not authenticated')
  }

  const { saveEvent = true } = options
  const event = {
    ...unsignedEvent,
    created_at: parseInt((Date.now() / 1000).toString()),
  }

  const pub = new NostrPublisher(event, { signer: options.signer })

  return of(pub).pipe(
    mergeMap((x) => x.signedEvent),
    map(parseEventMetadata),
    tap(setEventData),
    tap((event) => {
      if (saveEvent) {
        dbSqlite.insertEvent(event)
      }
    }),
    shareReplay(),
  )
}

export function broadcastEvent(signedEvent: NostrEvent, options: LocalPublisherOptions = {}) {
  const relays$ = merge(
    options.relays ? of(options.relays) : subscribeEventRelays(signedEvent, { maxRelaysPerUser: 20 }),
    of(options.includeRelays || []),
  )
  const pub = new NostrPublisher(undefined, {
    ...options,
    include: [signedEvent],
    relays: relays$,
  })

  return of(pub).pipe(
    broadcast(pool),
    connect((shared$) => {
      return merge(
        shared$.pipe(
          tap((res) => store.set(addPublishAtom, res)),
          tap(([relay, , status, , event]) => {
            if (status) {
              dbSqlite.insertSeen(relay, event)
              setSeenData(event, relay)
            }
          }),
        ),
        // Handle relays that require authentication
        createAuthenticator({
          pool,
          auto: true,
          whitelist: relays$,
          signer: options.signer!,
        }).pipe(
          takeUntil(shared$.pipe(ignoreElements(), endWith(true))),
          mergeMap(([relay, res]) => {
            if (res.toUpperCase() === RelayToClient.OK) {
              return of(new NostrPublisher(undefined, { include: [signedEvent], relays: of([relay]) })).pipe(
                broadcast(pool),
                tap((res) => {
                  store.set(resetPublishEventRelayAtom, [signedEvent.id, relay])
                  store.set(addPublishAtom, res)
                }),
              )
            }
            return EMPTY
          }),
          ignoreElements(),
        ),
      )
    }),
  )
}

export function publish(unsignedEvent: Omit<UnsignedEvent, 'created_at'>, options: LocalPublisherOptions) {
  return signAndSave(unsignedEvent, options).pipe(
    mergeMap((signedEvent) => {
      const { metadata, ...event } = signedEvent
      return merge(broadcastEvent(event, options).pipe(ignoreElements()), of(signedEvent))
    }),
    shareReplay(),
  )
}
