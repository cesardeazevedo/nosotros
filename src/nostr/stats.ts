import type { Relay } from '@/core/Relay'
import type { NostrEvent, NostrFilter } from '@/core/types'
import { RelayToClient } from '@/core/types'
import type { Note } from '@/stores/notes/note'
import { relaysStore } from '@/stores/relays/relays.store'
import type { Repost } from '@/stores/reposts/repost'
import type { Observable } from 'rxjs'
import { catchError, EMPTY, map, merge, mergeMap, of, takeUntil, tap } from 'rxjs'
import { db } from './db'
import type { NostrClient } from './nostr'
import type { ZapMetadataDB } from './types'

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

export function subscribeNoteStats(
  id: string,
  client: NostrClient,
  options?: {
    zaps?: boolean
    replies?: boolean
    reactions?: boolean
    reposts?: boolean
    lastSyncedAt?: number
  },
): Observable<Note | Repost | NostrEvent | [NostrEvent, ZapMetadataDB]> {
  const filter: NostrFilter = { '#e': [id] }
  if (options?.lastSyncedAt) {
    filter.since = options.lastSyncedAt
  }
  const subOptions = { cacheFilter: { ...filter, since: 0 } }
  return merge(
    options?.zaps !== false ? client.zaps.subscribe(filter, subOptions) : EMPTY,
    options?.reposts !== false ? client.reposts.subscribe(filter, subOptions) : EMPTY,
    options?.reactions !== false ? client.reactions.subscribe(filter, { ...subOptions, queryLocal: false }) : EMPTY,
    options?.replies !== false
      ? client.notes
          .subReplies(id)
          .pipe(mergeMap((note) => subscribeNoteStats(note.id, client, { ...options, replies: false })))
      : EMPTY,
  )
}
