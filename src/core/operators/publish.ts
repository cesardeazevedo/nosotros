import type { NostrPublisher } from 'core/NostrPublish'
import type { Pool } from 'core/pool'
import type { MessageReceivedOK } from 'core/types'
import { ClientToRelay, RelayToClient } from 'core/types'
import type { NostrEvent } from 'nostr-tools'
import type { OperatorFunction } from 'rxjs'
import { EMPTY, filter, map, mergeMap, pipe, take, takeUntil, timer } from 'rxjs'

export type PublishResponse = [url: string, eventId: string, status: boolean, msg: string, event: NostrEvent]

export function publish(pool: Pool): OperatorFunction<NostrPublisher, PublishResponse> {
  return pipe(
    mergeMap((publisher: NostrPublisher) => publisher.relayEvent),

    mergeMap(([url, event]) => {
      const relay = pool.get(url)

      if (relay) {
        relay.websocket$.next([ClientToRelay.EVENT, event] as never)
        // return of([relay.url, event.id, true, 'ok', event] as PublishResponse).pipe(delay(5000)) // test

        return relay.websocket$.pipe(
          filter((res) => res[1] === event.id),
          filter((res): res is MessageReceivedOK => res[0].toLowerCase() === RelayToClient.OK),
          take(1),
          map((res) => [url, res[1], res[2], res[3], event] as PublishResponse),
        )
      }
      return EMPTY
    }),

    takeUntil(timer(10000)),
  )
}
