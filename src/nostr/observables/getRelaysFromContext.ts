import { EMPTY, merge, of } from 'rxjs'
import type { NostrContext } from '../context'
import { subscribeInboxRelays, subscribeOutboxRelays } from '../subscriptions/subscribeMailbox'
import { subscribeRelaySetsFromContext } from '../subscriptions/subscribeRelaySets'
import { READ, WRITE } from '../types'

export const getRelaysFromContext = (ctx: NostrContext) => {
  const { permission = 0 } = ctx
  const relays$ = of(ctx.relays || [])
  const relaySets$ = subscribeRelaySetsFromContext(ctx)
  const inboxRelays$ = permission & READ ? subscribeInboxRelays(ctx) : EMPTY
  const outboxRelays$ = permission & WRITE ? subscribeOutboxRelays(ctx) : EMPTY
  return merge(relays$, relaySets$, inboxRelays$, outboxRelays$)
}
