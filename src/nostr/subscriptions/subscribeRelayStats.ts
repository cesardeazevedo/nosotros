import type { Relay } from '@/core/Relay'
import { RelayToClient } from '@/core/types'
import { relaysStore } from '@/stores/relays/relays.store'
import { catchError, EMPTY, map, merge, mergeMap, of, takeUntil, tap } from 'rxjs'
import { db } from '../db'

export function subscribeRelayStats(relay: Relay) {
  of(relay.url)
    .pipe(
      mergeMap((url) => db.relayStats.query(url)),
      map((stats) => relaysStore.add(relay.url, stats)),
      mergeMap((relayStore) => {
        return merge(
          relay.open$.pipe(tap(() => relayStore.connect())),
          relay.close$.pipe(tap(() => relayStore.disconnect())),
          relay.websocket$.pipe(
            tap((msg) => {
              switch (msg[0].toLowerCase()) {
                case RelayToClient.EVENT: {
                  relayStore.increment('events')
                  break
                }
                case RelayToClient.NOTICE: {
                  relayStore.addNotice(msg[1])
                  break
                }
                case RelayToClient.AUTH: {
                  relaysStore.addAuth(relay.url, msg[1])
                  relayStore.increment('auths')
                  break
                }
                case RelayToClient.EOSE: {
                  relayStore.increment('eoses')
                  break
                }
              }
            }),
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            catchError((error) => {
              relayStore.disconnect()
              return EMPTY
            }),
          ),
        )
      }),
      takeUntil(relay.close$),
    )
    .subscribe()
}
