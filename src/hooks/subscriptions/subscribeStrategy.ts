import { addSubscriptionGroupAtom, setSubscriptionGroupCacheQueriedAtom } from '@/atoms/devtools.atoms'
import { store } from '@/atoms/store'
import { bufferDebounce } from '@/core/operators/bufferDebounce'
import type { NostrFilter } from '@/core/types'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { NostrContext } from '@/nostr/context'
import { dbSqlite } from '@/nostr/db'
import type { NostrEvent } from 'nostr-tools'
import { matchFilter, type Filter } from 'nostr-tools'
import { EMPTY, from, identity, map, merge, mergeMap, of, filter as rxFilter, takeUntil, tap, timer } from 'rxjs'
import invariant from 'tiny-invariant'
import { createSubscription } from './createSubscription'
import { subscribe } from './subscribe'

export function subscribeRemote(ctx: NostrContext, filter: Filter, cached?: NostrEventDB[]) {
  const subscriptionGroupId =
    ctx.subscriptionGroupId || store.set(addSubscriptionGroupAtom, { ctx, filter: filter as NostrFilter })
  const nextCtx = { ...ctx, subscriptionGroupId }
  const sub = createSubscription(nextCtx, filter, cached)
  return subscribe(sub, nextCtx).pipe(
    bufferDebounce(500),
    rxFilter((events) => events.length > 0),
  )
}

const withSubscriptionGroup = (ctx: NostrContext, filter: NostrFilter) => {
  const subscriptionGroupId = ctx.subscriptionGroupId || store.set(addSubscriptionGroupAtom, { ctx, filter })
  return { ...ctx, subscriptionGroupId }
}

export function subscribeStrategy(ctx: NostrContext, filter: NostrFilter, dbFilter = filter) {
  const nextCtx = withSubscriptionGroup(ctx, filter)
  switch (ctx.network) {
    case 'CACHE_FIRST': {
      return from(dbSqlite.queryEvents(dbFilter)).pipe(
        mergeMap((cached) => {
          store.set(setSubscriptionGroupCacheQueriedAtom, {
            groupId: nextCtx.subscriptionGroupId!,
            count: cached.length,
          })
          if (cached.length !== 0) {
            return of(cached)
          }
          return subscribeRemote(nextCtx, filter, cached)
        }),
      )
    }
    case 'STALE_WHILE_REVALIDATE': {
      return from(dbSqlite.queryEvents(dbFilter)).pipe(
        mergeMap((cached) => {
          store.set(setSubscriptionGroupCacheQueriedAtom, {
            groupId: nextCtx.subscriptionGroupId!,
            count: cached.length,
          })
          return merge(cached ? of(cached) : EMPTY, subscribeRemote(nextCtx, filter, cached))
        }),
      )
    }
    case 'CACHE_FIRST_BATCH': {
      invariant(ctx.batcher, 'Batcher required')
      const batcher = ctx.batcher
      return from(dbSqlite.queryEvents(dbFilter)).pipe(
        mergeMap((events) => {
          store.set(setSubscriptionGroupCacheQueriedAtom, {
            groupId: nextCtx.subscriptionGroupId!,
            count: events.length,
          })
          const cached = events.length ? of(events).pipe(rxFilter((events) => events.length > 0)) : EMPTY
          if (events.length !== 1) {
            batcher.next(filter, ctx.relayHints, events, {
              subId: ctx.subId,
              queryKey: ctx.queryKey,
              maxRelaysPerUser: ctx.maxRelaysPerUser,
              subscriptionGroupId: nextCtx.subscriptionGroupId,
            })
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
      return from(dbSqlite.queryEvents(dbFilter)).pipe(
        tap((events) =>
          store.set(setSubscriptionGroupCacheQueriedAtom, {
            groupId: nextCtx.subscriptionGroupId!,
            count: events.length,
          }),
        ),
      )
    }
    case 'STALE_WHILE_REVALIDATE_BATCH': {
      invariant(ctx.batcher, 'Batcher required')
      const batcher = ctx.batcher
      return from(dbSqlite.queryEvents(dbFilter)).pipe(
        mergeMap((events) => {
          store.set(setSubscriptionGroupCacheQueriedAtom, {
            groupId: nextCtx.subscriptionGroupId!,
            count: events.length,
          })
          batcher.next(filter, ctx.relayHints, events, {
            subId: ctx.subId,
            queryKey: ctx.queryKey,
            maxRelaysPerUser: ctx.maxRelaysPerUser,
            subscriptionGroupId: nextCtx.subscriptionGroupId,
          })
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
      return subscribeRemote(nextCtx, filter)
    }
    default: {
      return EMPTY
    }
  }
}
