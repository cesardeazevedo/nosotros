import type { NostrPublisher } from 'core/NostrPublish'
import type { Pool } from 'core/pool'
import type { MessageReceivedOK } from 'core/types'
import { ClientToRelay, RelayToClient } from 'core/types'
import type { NostrEvent } from 'nostr-tools'
import type { OperatorFunction } from 'rxjs'
import { catchError, EMPTY, filter, map, mergeMap, pipe, take, takeUntil, timer } from 'rxjs'

export type BroadcastResponse = [url: string, eventId: string, status: boolean, msg: string, event: NostrEvent]

export function broadcast(pool: Pool): OperatorFunction<NostrPublisher, BroadcastResponse> {
  return pipe(
    mergeMap((publisher: NostrPublisher) => publisher.relayEvent),

    mergeMap(([url, event]) => {
      const relay = pool.get(url)

      if (relay) {
        relay.websocket$.next([ClientToRelay.EVENT, event] as never)

        return relay.websocket$.pipe(
          filter((res) => res[1] === event.id),
          filter((res): res is MessageReceivedOK => res[0].toLowerCase() === RelayToClient.OK),
          take(1),
          map((res) => [url, res[1], res[2], res[3], event] as BroadcastResponse),
          takeUntil(timer(10000)),
          catchError(() => EMPTY),
        )
      }
      return EMPTY
    }),
  )
}
