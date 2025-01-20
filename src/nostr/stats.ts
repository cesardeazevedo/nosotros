import { Kind } from '@/constants/kinds'
import type { Relay } from '@/core/Relay'
import type { NostrEvent, NostrFilter } from '@/core/types'
import { RelayToClient } from '@/core/types'
import { relaysStore } from '@/stores/relays/relays.store'
import type { Observable } from 'rxjs'
import { catchError, EMPTY, map, merge, mergeMap, of, takeUntil, tap } from 'rxjs'
import { db } from './db'
import type { ClientSubOptions, NostrClient } from './nostr'

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

export type NoteStatsOptions = {
  zaps?: boolean
  replies?: boolean
  reactions?: boolean
  reposts?: boolean
  lastSyncedAt?: number
}

export function subscribeNoteStats(
  id: string,
  client: NostrClient,
  options?: NoteStatsOptions,
): Observable<NostrEvent> {
  const filter: NostrFilter = { '#e': [id] }
  if (options?.lastSyncedAt) {
    filter.since = options.lastSyncedAt
  }
  const subOptions = (kinds: Kind[]): ClientSubOptions => ({ cacheFilter: { ...filter, kinds, since: 0 } })
  return merge(
    options?.zaps !== false ? client.zaps.subscribe(filter, subOptions([Kind.ZapReceipt])) : EMPTY,
    options?.reposts !== false ? client.reposts.subscribe(filter, subOptions([Kind.Repost])) : EMPTY,
    options?.reactions !== false ? client.reactions.subscribe(filter, subOptions([Kind.Reaction])) : EMPTY,
    options?.replies !== false
      ? client.notes
          .subReplies(id)
          .pipe(mergeMap((note) => subscribeNoteStats(note.id, client, { ...options, replies: false })))
      : EMPTY,
  )
}
