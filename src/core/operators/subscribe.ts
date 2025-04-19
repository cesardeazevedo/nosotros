import type { NostrSubscription } from 'core/NostrSubscription'
import type { Relay } from 'core/Relay'
import type { MessageReceived, NostrEvent, NostrFilter } from 'core/types'
import { ClientToRelay, RelayToClient } from 'core/types'
import type { OperatorFunction } from 'rxjs'
import { EMPTY, catchError, filter, map, mergeMap, takeUntil, takeWhile, timer } from 'rxjs'

export function subscribe(
  relay: Relay,
  filters?: NostrFilter[],
  closeOnEose = true,
): OperatorFunction<NostrSubscription, [string, NostrEvent]> {
  return mergeMap((sub: NostrSubscription) => {
    const subMsg = () => [ClientToRelay.REQ, sub.id, ...(filters || sub.filters)]
    const unsubMsg = () => [ClientToRelay.CLOSE, sub.id]
    const messageFilter = (msg: MessageReceived) => msg[1] === sub.id

    return relay.websocket$.multiplex(subMsg, unsubMsg, messageFilter).pipe(
      takeWhile((msg) => {
        const verb = msg[0].toUpperCase()
        return (verb !== RelayToClient.EOSE && verb !== RelayToClient.CLOSED) || closeOnEose === false
      }),
      // needed in case of closeOnEose false
      filter(([verb]) => verb.toUpperCase() === RelayToClient.EVENT),

      map((msg) => [relay.url, msg[2]] as [string, NostrEvent]),

      catchError(() => EMPTY),

      takeUntil(closeOnEose ? timer(10000) : EMPTY),
    )
  })
}
