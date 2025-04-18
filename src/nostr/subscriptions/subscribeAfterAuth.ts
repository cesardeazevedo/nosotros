import type { NostrSubscription } from '@/core/NostrSubscription'
import { identity } from 'observable-hooks'
import { distinct, filter, map, mergeMap, takeUntil, timer } from 'rxjs'
import type { NostrContext } from '../context'
import { getRelaysFromContext } from '../observables/getRelaysFromContext'
import { pool } from '../pool'
import { createSubscription } from './createSubscription'

export function subscribeAfterAuth(sub: NostrSubscription, ctx: NostrContext) {
  return getRelaysFromContext(ctx).pipe(
    mergeMap(identity),
    distinct(),
    map((url) => pool.get(url)),
    filter((x) => !!x),
    mergeMap((relay) => relay.authOk$),
    map(([url]) => createSubscription(sub.filters[0], { ...ctx, relays: [url] })),
    takeUntil(timer(10000)),
  )
}
