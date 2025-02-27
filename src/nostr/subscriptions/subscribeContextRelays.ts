import { onAuth } from '@/core/operators/onAuth'
import { distinct, EMPTY, filter, identity, map, merge, mergeMap, tap } from 'rxjs'
import type { NostrContext } from '../context'
import { pool } from '../pool'
import { READ, WRITE } from '../types'

export function subscribeContextRelays(ctx: NostrContext) {
  const permission = ctx.permission || READ | WRITE
  ctx.localSets.forEach((url) => pool.get(url))
  return merge(
    permission & READ ? ctx.inbox$.pipe(tap((relays) => relays.forEach((url) => ctx.inboxSets.add(url)))) : EMPTY,
    permission & WRITE ? ctx.outbox$.pipe(tap((relays) => relays.forEach((url) => ctx.outboxSets.add(url)))) : EMPTY,
  ).pipe(
    // Handle auth
    mergeMap(identity),
    map((relay) => pool.get(relay)),
    filter((relay) => !!relay),
    mergeMap((relay) => {
      return relay.websocket$.pipe(
        onAuth(),
        map((msg) => [relay.url, msg] as const),
      )
    }),
    distinct(([msg]) => msg[1]),
    mergeMap(([relay, msg]) => ctx.onAuth?.(relay, msg[1]) || EMPTY),
  )
}
