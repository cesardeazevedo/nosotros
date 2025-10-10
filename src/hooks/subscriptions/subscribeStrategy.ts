import { bufferDebounce } from '@/core/operators/bufferDebounce'
import type { NostrFilter } from '@/core/types'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { NostrContext } from '@/nostr/context'
import { dbSqlite } from '@/nostr/db'
import type { NostrEvent } from 'nostr-tools'
import { matchFilter, type Filter } from 'nostr-tools'
import { EMPTY, from, identity, map, merge, mergeMap, of, filter as rxFilter, takeUntil, timer } from 'rxjs'
import invariant from 'tiny-invariant'
import { createSubscription } from './createSubscription'
import { subscribe } from './subscribe'

export function subscribeRemote(ctx: NostrContext, filter: Filter, cached?: NostrEventDB[]) {
  const sub = createSubscription(ctx, filter, cached)
  return subscribe(sub, ctx).pipe(
    bufferDebounce(200),
    rxFilter((events) => events.length > 0),
  )
}

export function subscribeStrategy(ctx: NostrContext, filter: NostrFilter, dbFilter = filter) {
  switch (ctx.network) {
    case 'CACHE_FIRST': {
      return from(dbSqlite.queryEvents(dbFilter)).pipe(
        mergeMap((cached) => {
          if (cached.length !== 0) {
            return of(cached)
          }
          return subscribeRemote(ctx, filter, cached)
        }),
      )
    }
    case 'STALE_WHILE_REVALIDATE': {
      return from(dbSqlite.queryEvents(dbFilter)).pipe(
        mergeMap((cached) => {
          return merge(cached ? of(cached) : EMPTY, subscribeRemote(ctx, filter, cached))
        }),
      )
    }
    case 'CACHE_FIRST_BATCH': {
      invariant(ctx.batcher, 'Batcher required')
      const batcher = ctx.batcher
      return from(dbSqlite.queryEvents(dbFilter)).pipe(
        mergeMap((events) => {
          const cached = events.length ? of(events).pipe(rxFilter((events) => events.length > 0)) : EMPTY
          if (events.length !== 1) {
            batcher.next(filter, ctx.relayHints, events)
            return merge(
              cached,
              batcher.$.pipe(
                mergeMap(identity),
                rxFilter((e: NostrEventDB): e is NostrEventDB => matchFilter(filter, e as unknown as NostrEvent)),
                map((x) => [x]),
                takeUntil(timer(3500)),
              ),
            )
          }
          return cached
        }),
      )
    }
    case 'CACHE_ONLY': {
      return from(dbSqlite.queryEvents(dbFilter))
    }
    case 'STALE_WHILE_REVALIDATE_BATCH': {
      invariant(ctx.batcher, 'Batcher required')
      const batcher = ctx.batcher
      return from(dbSqlite.queryEvents(dbFilter)).pipe(
        mergeMap((events) => {
          batcher.next(filter, ctx.relayHints, events)
          return merge(
            events.length ? of(events).pipe(rxFilter((events) => events.length > 0)) : EMPTY,
            batcher.$.pipe(
              mergeMap(identity),
              rxFilter((e: NostrEventDB): e is NostrEventDB => matchFilter(filter, e as unknown as NostrEvent)),
              map((x) => [x]),
              takeUntil(timer(3500)),
            ),
          )
        }),
      )
    }
    case 'LIVE':
    case 'REMOTE_ONLY': {
      return subscribeRemote(ctx, filter)
    }
    default: {
      return EMPTY
    }
  }
}
