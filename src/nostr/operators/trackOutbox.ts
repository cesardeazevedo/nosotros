import type { RelayFilters } from '@/core/NostrSubscription'
import type { NostrFilter, RelayHints } from '@/core/types'
import { delay, EMPTY, filter, from, identity, map, merge, mergeMap, takeUntil, tap, timer } from 'rxjs'
import type { RelaySelectionConfig } from '../helpers/selectRelays'
import type { NostrContext } from '../context'
import { WRITE } from '../types'
import { trackMailbox } from './trackMailbox'

function trackPubkeys(
  filter: NostrFilter,
  tag: keyof Pick<NostrFilter, 'authors' | '#p'>,
  options: RelaySelectionConfig,
  ctx: NostrContext,
) {
  return from(filter[tag] || []).pipe(
    mergeMap((pubkey) => trackMailbox(pubkey, options, ctx)),
    mergeMap(identity),
    map(({ relay, pubkey }) => [relay, [{ ...filter, [tag]: [pubkey] }]] as RelayFilters),
  )
}

function trackIds(filter: NostrFilter, hints: RelayHints, config: RelaySelectionConfig, ctx: NostrContext) {
  // the id field to be extracted from, current ids and '#e'
  const field = filter.ids ? 'ids' : filter['#e'] ? '#e' : null
  if (field) {
    return from(Object.entries(hints?.idHints || {})).pipe(
      mergeMap(([id, pubkeys]) => {
        return from(pubkeys).pipe(
          mergeMap((pubkey) => trackMailbox(pubkey, config, ctx)),
          mergeMap(identity),
          map((userRelay) => [id, userRelay.relay]),
        )
      }),
      map(([id, relay]) => [relay, [{ ...filter, [field]: [id] }]] as RelayFilters),
    )
  }
  return EMPTY
}

export function trackOutbox(filters: NostrFilter[], hints: RelayHints, ctx: NostrContext) {
  const config = {
    permission: WRITE,
    ignore: ctx.outboxSets,
    maxRelaysPerUser: ctx.settings.maxRelaysPerUserOutbox,
  }
  return from(filters).pipe(
    delay(1500),
    mergeMap((filter) => {
      // Track relays based on pubkey hints
      const ids$ = trackIds(filter, hints, config, ctx)
      // Build relays for authors
      const authors$ = trackPubkeys(filter, 'authors', config, ctx)
      // Build relays for #p authors
      const p$ = trackPubkeys(filter, '#p', config, ctx)

      return merge(ids$, authors$, p$)
    }),

    filter((x) => x.length > 0),

    takeUntil(timer(4000)),
  )
}
