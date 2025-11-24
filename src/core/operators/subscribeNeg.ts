import { NostrSubscription } from 'core/NostrSubscription'
import type { Relay } from 'core/Relay'
import type { MessageReceived } from 'core/types'
import { ClientToRelay, RelayToClient } from 'core/types'
import { catchError, EMPTY, mergeAll, mergeMap, of, pipe, reduce, takeWhile, tap, timeout } from 'rxjs'
import { getNegentropy } from './getNegentropy'
import { subscribe } from './subscribe'

export function subscribeNeg(relay: Relay) {
  return pipe(
    mergeMap(async (sub: NostrSubscription) => {
      const negentropy = getNegentropy(sub.events)
      const msg = await negentropy.initiate()

      const subMsg = () => [ClientToRelay.NEG_OPEN, sub.id, sub.filter, msg]
      const unsubMsg = () => [ClientToRelay.NEG_CLOSE, sub.id]
      const messageFilter = (msg: MessageReceived) => msg[1] === sub.id || msg[0] === RelayToClient.NOTICE

      return relay.websocket$.multiplex(subMsg, unsubMsg, messageFilter).pipe(
        // Some relays (nostr.wine) isn't returning anything from negentropy
        timeout({
          each: 3000,
          with: () => {
            throw new Error(`Negentropy timeout error ${relay.url}`)
          },
        }),

        tap((msg) => {
          const verb = msg[0]
          switch (verb) {
            case RelayToClient.NEG_ERR: {
              throw new Error('Negentropy Error')
            }
            case RelayToClient.NOTICE: {
              // We want to know about other relays messages as this has not standard
              if (msg[1].toLowerCase() === 'error: bad msg: negentropy disabled') {
                // strfry message
                throw new Error(`Negentropy Error: ${relay.url} ${msg[1]}`)
              }
              console.warn('Negentropy Notice', relay.url, msg[1])
            }
          }
        }),

        mergeMap(async (msg) => {
          const result = await negentropy.reconcile(msg[2])
          const [nextMsg] = result

          if (nextMsg) {
            // Send next message back to relay
            // @ts-ignore
            relay.websocket$.next([ClientToRelay.NEG_MSG, sub.id, nextMsg])
          }

          return result
        }),

        takeWhile(([msg]) => msg !== null, true),

        reduce((acc, [, , ids]) => [...acc, ...ids], [] as string[]),

        mergeMap((ids) => {
          if (ids.length > 0) {
            const sub = new NostrSubscription({ ids })
            return of(sub).pipe(subscribe(relay))
          }
          return EMPTY
        }),

        catchError((error) => {
          // Disable negentropy for this relay
          relay.negentropy.next(false)
          throw new Error(error)
        }),
      )
    }),
    mergeAll(),
  )
}
