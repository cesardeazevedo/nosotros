import { FALLBACK_RELAYS } from '@/constants/relays'
import { pickBy } from '@/core/helpers/pickBy'
import { combineLatestWith, defaultIfEmpty, EMPTY, map, mergeMap, of, take } from 'rxjs'
import type { NostrContext } from '../context'
import type { RelayStatsDBMap } from '../db/queryRelayStats'
import { relayStats } from '../db/queryRelayStats'
import { selectRelays } from '../helpers/selectRelays'
import { ShareReplayCache } from '../replay'
import type { UserRelay } from '../types'
import { metadataSymbol, READ, WRITE } from '../types'
import { subscribeRelayList } from './subscribeRelayList'

const fallbackUserRelays = FALLBACK_RELAYS.map(
  (relay) =>
    ({
      relay,
      permission: READ | WRITE,
    }) as UserRelay,
)

export const toArrayRelay = map((data: UserRelay[]) => data.map((x) => x.relay))

export const replay = new ShareReplayCache<UserRelay[]>()
const selectRelaysReplay = replay.wrap((_key: string, data: UserRelay[], ctx: NostrContext, stats: RelayStatsDBMap) => {
  return of(selectRelays(data, ctx, stats))
})

export const subscribeMailbox = (pubkey: string, ctx: NostrContext) => {
  return subscribeRelayList(pubkey, ctx).pipe(
    map((event) => event[metadataSymbol].relayList || []),
    defaultIfEmpty(fallbackUserRelays),
    combineLatestWith(relayStats.pipe(take(1))),
    map(([userRelays, relayStats]) => {
      return [
        userRelays,
        pickBy(
          relayStats,
          userRelays.map((x) => x.relay),
        ) as RelayStatsDBMap,
      ] as const
    }),
    mergeMap(([data, stats]) => selectRelaysReplay(pubkey + ctx.permission, data, ctx, stats)),

    take(1),
  )
}

export const subscribeOutboxRelays = (ctx: NostrContext) => {
  return ctx.pubkey ? subscribeMailbox(ctx.pubkey, ctx).pipe(toArrayRelay) : EMPTY
}

export const subscribeInboxRelays = (ctx: NostrContext) => {
  return ctx.pubkey ? subscribeMailbox(ctx.pubkey, ctx).pipe(toArrayRelay) : EMPTY
}
