import { Kind } from '@/constants/kinds'
import type { NostrSubscriptionBuilder } from '@/core/NostrSubscriptionBuilder'
import { start } from '@/core/operators/start'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { parseEventMetadata } from '@/hooks/parsers/parseEventMetadata'
import type { NostrContext } from '@/nostr/context'
import { dbSqlite } from '@/nostr/db'
import { distinctEvent } from '@/nostr/operators/distinctEvents'
import { verifyWorker } from '@/nostr/operators/verifyWorker'
import { pool } from '@/nostr/pool'
import type { Observable } from 'rxjs'
import { filter, from, map, mergeMap, mergeWith, of, tap } from 'rxjs'
import { subscribeAfterAuth } from './subscribeAfterAuth'

export function subscribe(sub: NostrSubscriptionBuilder, ctx: NostrContext): Observable<NostrEventDB> {
  return of(sub).pipe(
    mergeWith(subscribeAfterAuth(ctx, sub)),

    start(pool),

    tap(([relay, event]) => {
      if (ctx.network !== 'REMOTE_ONLY' && [Kind.Text, Kind.Comment, Kind.Repost, Kind.Article].includes(event.kind)) {
        dbSqlite.insertSeen(relay, event)
      }
    }),

    distinctEvent(),

    mergeMap((event) => {
      if (ctx.network === 'REMOTE_ONLY') {
        return of(event).pipe(
          verifyWorker(sub),
          map(() => parseEventMetadata(event)),
        )
      }
      return from(dbSqlite.exists(event)).pipe(
        filter((found) => !found || (found.created_at || 0) < event.created_at),
        mergeMap(() => {
          return of(event).pipe(
            verifyWorker(sub),
            mergeMap((event) => dbSqlite.insertEvent(event)),
          )
        }),
      )
    }),

    filter(Boolean),
  )
}
