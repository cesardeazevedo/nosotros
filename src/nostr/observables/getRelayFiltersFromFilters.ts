import type { RelayFilters } from '@/core/NostrSubscription'
import type { NostrFilter, RelayHints } from '@/core/types'
import { EMPTY, filter, from, identity, map, merge, mergeMap, takeUntil, timer } from 'rxjs'
import type { NostrContext } from '../context'
import { subscribeMailbox } from '../subscriptions/subscribeMailbox'
import { READ, WRITE } from '../types'

function getRelayFiltersFromFilter(
  filter: NostrFilter,
  tag: keyof Pick<NostrFilter, 'authors' | '#p'>,
  ctx: NostrContext,
) {
  return from(filter[tag] || []).pipe(
    mergeMap((pubkey) => subscribeMailbox(pubkey, ctx)),
    mergeMap(identity),
    map(({ relay, pubkey }) => [relay, [{ ...filter, [tag]: [pubkey] }]] as RelayFilters),
  )
}

function getRelayFiltersFromIds(filter: NostrFilter, hints: RelayHints, ctx: NostrContext) {
  if (filter.ids) {
    return from(Object.entries(hints?.idHints || {})).pipe(
      mergeMap(([id, pubkeys]) => {
        return from(pubkeys).pipe(
          mergeMap((pubkey) => subscribeMailbox(pubkey, ctx)),
          mergeMap(identity),
          map((userRelay) => [id, userRelay.relay]),
        )
      }),
      map(([id, relay]) => [relay, [{ ...filter, ids: [id] }]] as RelayFilters),
    )
  }
  return EMPTY
}

export function getRelayFiltersFromFilters(filters: NostrFilter[], hints: RelayHints, ctx: NostrContext) {
  return from(filters).pipe(
    mergeMap((filter) => {
      // Track relays based on pubkey hints
      const ids$ = getRelayFiltersFromIds(filter, hints, { ...ctx, permission: WRITE })
      // Build relays for authors
      const authors$ = getRelayFiltersFromFilter(filter, 'authors', { ...ctx, permission: WRITE })
      // Build relays for #p authors
      const p$ = getRelayFiltersFromFilter(filter, '#p', { ...ctx, permission: READ })

      return merge(ids$, authors$, p$)
    }),

    filter((x) => x.length > 0),

    takeUntil(timer(5000)),
  )
}
