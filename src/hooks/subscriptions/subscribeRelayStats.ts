import { addRelay, setRelayAuth, setRelayConnected } from '@/atoms/relay.atoms'
import type { Relay } from '@/core/Relay'
import { RelayToClient } from '@/core/types'
import type { RelayStatsDB } from '@/db/types'
import { queryClient } from '@/hooks/query/queryClient'
import { queryKeys } from '@/hooks/query/queryKeys'
import { DEFAULT_STATS, relayStatsQueryOptions } from '@/hooks/query/useRelayStats'
import { catchError, EMPTY, filter, from, merge, mergeMap, of, takeUntil, tap, throttleTime } from 'rxjs'
import { dbSqlite } from '../../nostr/db'

export function subscribeRelayStats(relay: Relay) {
  of(relay.url)
    .pipe(
      filter((url) => !!new URL(url)),
      tap((url) => addRelay(url)),
      mergeMap((url) => {
        return from(
          queryClient.fetchQuery(relayStatsQueryOptions(url)).then((stats) => ({ url, stats: stats || DEFAULT_STATS })),
        )
      }),
      mergeMap(({ url }) => {
        const updateStats = (updater: (prev: RelayStatsDB) => RelayStatsDB) => {
          queryClient.setQueryData(relayStatsQueryOptions(url).queryKey, (prev: RelayStatsDB) => {
            return updater(prev || DEFAULT_STATS)
          })
        }
        const increment = (field: keyof RelayStatsDB) => {
          updateStats((prev) => {
            return {
              ...prev,
              [field]: ((prev[field] as number) ?? 0) + 1,
            }
          })
        }

        return merge(
          relay.open$.pipe(tap(() => setRelayConnected(url, true))),
          relay.close$.pipe(tap(() => setRelayConnected(url, false))),
          relay.auth$.pipe(
            tap((msg) => {
              increment('auths')
              setRelayAuth(url, msg[1])
            }),
          ),
          relay.authOk$.pipe(tap(() => setRelayAuth(url, false))),
          relay.notice$.pipe(
            tap((msg) => {
              updateStats((prev) => ({
                ...prev,
                notices: [...(prev?.notices || []), msg[1]].slice(0, 5),
              }))
            }),
          ),
          relay.message$.pipe(
            tap((msg) => {
              switch (msg[0].toUpperCase()) {
                case RelayToClient.EVENT: {
                  increment('events')
                  break
                }
                case RelayToClient.EOSE: {
                  increment('eoses')
                  break
                }
              }
            }),
            catchError(() => {
              updateStats((prev) => ({ ...prev, connected: false }))
              return EMPTY
            }),
          ),
        )
      }),

      throttleTime(5000, undefined, { leading: false, trailing: true }),

      mergeMap(async () => {
        const data = queryClient.getQueryData<RelayStatsDB>(queryKeys.relayStats(relay.url))
        if (data) {
          return await dbSqlite.insertRelayStats({ ...data, url: relay.url })
        }
        return EMPTY
      }),

      takeUntil(relay.close$),
    )
    .subscribe()
}
