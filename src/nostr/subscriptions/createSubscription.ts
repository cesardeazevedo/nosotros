import { NostrSubscription } from '@/core/NostrSubscription'
import type { NostrFilter } from '@/core/types'
import { EMPTY, merge, of } from 'rxjs'
import type { NostrContext } from '../context'
import { trackOutbox } from '../operators/trackOutbox'
import { pruneFilters } from '../prune'
import { READ, WRITE } from '../types'

export function createSubscription(filters: NostrFilter, ctx: NostrContext) {
  const permission = ctx.permission || READ | WRITE
  return new NostrSubscription(filters, {
    ...ctx.subOptions,
    relays: merge(
      permission & READ ? ctx.inbox$ : EMPTY,
      permission & WRITE ? ctx.outbox$ : EMPTY,
      of(ctx.relays || []),
      ctx.subOptions?.relays || EMPTY,
    ),
    relayHints: ctx.settings.hints ? ctx?.subOptions?.relayHints : {},
    outbox:
      ctx.settings.outbox && ctx?.subOptions?.outbox !== false
        ? (filters, hints) => trackOutbox(filters, hints || {}, ctx)
        : () => EMPTY,
    transform: ctx.subOptions?.prune === false ? undefined : pruneFilters,
  })
}
