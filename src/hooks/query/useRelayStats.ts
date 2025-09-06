import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import { dbSqlite } from '@/nostr/db'
import { queryKeys } from './queryKeys'
import { useQuery } from '@tanstack/react-query'

export const DEFAULT_STATS = {
  connects: 0,
  closes: 0,
  events: 0,
  eoses: 0,
  notices: [],
  auths: 0,
  errors: 0,
  errorMessages: [],
  subscriptions: 0,
  publishes: 0,
  lastAuth: 0,
  lastConnected: 0,
}

export function relayStatsQueryOptions(relay: string) {
  const formatted = formatRelayUrl(relay)
  return {
    queryKey: queryKeys.relayStats(formatted),
    queryFn: async () => {
      const res = await dbSqlite.queryRelayStats([formatted])
      return res.length ? res[0] : null
    },
  }
}

export function allRelayStatsQueryOptions() {
  return {
    queryKey: queryKeys.allRelayStats(),
    queryFn: async () => {
      return await dbSqlite.queryRelayStats([])
    },
  }
}

export function useRelayStats(relay: string) {
  return useQuery(relayStatsQueryOptions(relay))
}
