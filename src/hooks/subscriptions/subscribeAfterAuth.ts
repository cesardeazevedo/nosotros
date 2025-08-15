import type { NostrSubscriptionBuilder } from '@/core/NostrSubscriptionBuilder'
import type { NostrContext } from '@/nostr/context'
import { pool } from '@/nostr/pool'
import { distinct, filter, from, map, mergeMap, takeUntil, timer } from 'rxjs'
import { createSubscription } from './createSubscription'

export function subscribeAfterAuth(ctx: NostrContext, sub: NostrSubscriptionBuilder) {
  return from(ctx.relays || []).pipe(
    distinct(),
    map((url) => pool.get(url)),
    filter((x) => !!x),
    mergeMap((relay) => relay.authOk$.pipe(takeUntil(timer(2000)))),
    map(([url]) => createSubscription({ ...ctx, relays: [url] }, sub.filter || {})),
  )
}
