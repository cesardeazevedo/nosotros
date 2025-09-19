import { createSubscriptionBuilder } from '@/core/NostrSubscriptionBuilder'
import type { NostrFilter } from '@/core/types'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import type { NostrContext } from '@/nostr/context'
import { EMPTY } from 'rxjs'
import { subscribeOutbox } from './subscribeOutbox'

export function createSubscription(ctx: NostrContext, filter: NostrFilter, cached?: NostrEventDB[]) {
  const sub = createSubscriptionBuilder({
    id: ctx.subId,
    filter,
    events: new Map(cached?.map((event) => [event.id, event] as const)),
    relays: ctx.relays,
    relayHints: ctx.relayHints,
    relayFilters: ctx.outbox !== false ? subscribeOutbox(filter, ctx) : EMPTY,
    closeOnEose: ctx.closeOnEose,
    negentropy: ctx.negentropy,
  })
  return sub
}
