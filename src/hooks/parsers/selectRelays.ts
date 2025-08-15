import { RELAY_SELECTION_IGNORE } from '@/constants/relays'
import type { RelayStatsDB } from '@/db/types'
import type { NostrContext } from '../../nostr/context'
import { pool } from '../../nostr/pool'
import type { UserRelay } from './parseRelayList'

export function selectRelays(data: UserRelay[], ctx: NostrContext, stats?: Record<string, RelayStatsDB>) {
  const res = data
    .filter((data) => !pool.blacklisted?.has(data.relay))
    .filter((data) => !RELAY_SELECTION_IGNORE.includes(data.relay))
    .filter((data) => !ctx.ignoreRelays?.includes(data.relay))
    .filter((data) => data.relay.startsWith('wss://'))
    .filter((data) => {
      return ctx.permission !== undefined ? !!(data.permission & ctx.permission) || !data.permission : true
    })
    .toSorted((a, b) => {
      const stats1 = stats?.[a.relay]
      const stats2 = stats?.[b.relay]
      const events1 = stats1?.events || 0
      const events2 = stats2?.events || 0
      return events2 - events1
    })
    .slice(0, ctx.maxRelaysPerUser || 2)
  return res
}
