import { NostrSubscription } from '@/core/NostrSubscription'
import type { NostrFilter } from '@/core/types'
import { EMPTY } from 'rxjs'
import type { NostrContext } from '../context'
import { getRelayFiltersFromFilters } from '../observables/getRelayFiltersFromFilters'
import { getRelaysFromContext } from '../observables/getRelaysFromContext'
import { pruneFilters } from '../prune'

export function createSubscription(filters: NostrFilter, ctx: NostrContext) {
  return new NostrSubscription(filters, {
    relays: getRelaysFromContext(ctx),
    relayHints: ctx.relayHints,
    outbox: ctx.outbox ? (filters, hints) => getRelayFiltersFromFilters(filters, hints || {}, ctx) : () => EMPTY,
    transform: ctx.prune === false ? undefined : pruneFilters,
  })
}
