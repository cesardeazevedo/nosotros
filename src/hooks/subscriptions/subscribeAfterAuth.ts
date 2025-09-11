import type { NostrSubscriptionBuilder } from '@/core/NostrSubscriptionBuilder'
import type { NostrContext } from '@/nostr/context'
import { pool } from '@/nostr/pool'
import { distinct, EMPTY, filter, from, map, mergeMap, takeUntil, timer } from 'rxjs'
import { createSubscription } from './createSubscription'

export function subscribeAfterAuth(ctx: NostrContext, sub: NostrSubscriptionBuilder) {
  if (ctx.relays) {
    return from(ctx.relays || []).pipe(
      distinct(),
      map((url) => pool.get(url)),
      filter((x) => !!x),
      mergeMap((relay) => relay.authOk$.pipe(takeUntil(timer(20000)))),
      map(([url]) => createSubscription({ ...ctx, relays: [url] }, sub.filter || {})),
    )
  }
  return EMPTY
}
