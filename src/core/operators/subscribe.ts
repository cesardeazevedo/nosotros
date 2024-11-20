import type { NostrSubscription } from 'core/NostrSubscription'
import type { Relay } from 'core/Relay'
import type { MessageReceived, NostrEvent, NostrFilter } from 'core/types'
import { ClientToRelay, RelayToClient } from 'core/types'
import type { OperatorFunction } from 'rxjs'
import { EMPTY, catchError, map, mergeMap, takeUntil, takeWhile, timer } from 'rxjs'

export function subscribe(
  relay: Relay,
  filters?: NostrFilter[],
): OperatorFunction<NostrSubscription, [string, NostrEvent]> {
  return mergeMap((sub: NostrSubscription) => {
    const subMsg = () => [ClientToRelay.REQ, sub.id, ...(filters || sub.filters)]
    const unsubMsg = () => [ClientToRelay.CLOSE, sub.id]
    const messageFilter = (msg: MessageReceived) => msg[1] === sub.id

    return relay.websocket$.multiplex(subMsg, unsubMsg, messageFilter).pipe(
      map((msg) => msg as unknown as MessageReceived),
      takeWhile((msg) => {
        const verb = msg[0].toLowerCase()
        return verb !== RelayToClient.EOSE && verb !== RelayToClient.CLOSED
      }),
      map((msg) => [relay.url, msg[2]] as [string, NostrEvent]),

      catchError(() => EMPTY),

      takeUntil(timer(5000)),
    )
  })
}
