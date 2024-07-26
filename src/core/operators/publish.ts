import type { NostrPublisher } from 'core/NostrPublish'
import type { Pool } from 'core/pool'
import type { MessageReceivedOK } from 'core/types'
import { ClientToRelay, RelayToClient } from 'core/types'
import type { OperatorFunction } from 'rxjs'
import { EMPTY, filter, map, mergeMap, pipe, take, takeUntil, timer } from 'rxjs'

export function publish(pool: Pool): OperatorFunction<NostrPublisher, readonly [string, string, boolean, string]> {
  return pipe(
    mergeMap((event: NostrPublisher) => event.relayEvent),

    mergeMap(([url, event]) => {
      const relay = pool.getOrAddRelay(url)

      if (relay) {
        relay.websocket$.next([ClientToRelay.EVENT, event] as never)

        return relay.websocket$.pipe(
          filter((res) => res[1] === event.id),
          filter((res): res is MessageReceivedOK => {
            return res[0].toLowerCase() === RelayToClient.OK
          }),
          take(1),
          map((res) => [url, res[1], res[2], res[3]] as const),
        )
      }
      return EMPTY
    }),

    takeUntil(timer(5000)),
  )
}
