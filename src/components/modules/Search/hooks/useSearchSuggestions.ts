import { Kind } from '@/constants/kinds'
import { SEARCH_RELAYS } from '@/constants/relays'
import { createEventQueryOptions } from '@/hooks/query/useQueryBase'
import { dbSqlite } from '@/nostr/db'
import { useQuery } from '@tanstack/react-query'

type SearchOptions = {
  query: string
  limit: number
  suggestQuery?: boolean
  suggestRelays?: boolean
}

export type SearchItem =
  | { type: 'user'; pubkey: string }
  | { type: 'user_relay'; pubkey: string }
  | { type: 'query'; query: string }
  | { type: 'relay'; relay: string }

function useSearchOnRelays(options: SearchOptions) {
  return useQuery(
    createEventQueryOptions({
      queryKey: ['search', options.query],
      filter: {
        kinds: [Kind.Metadata],
        search: options.query.toLowerCase(),
        limit: 15,
      },
      enabled: !!options.query,
      ctx: {
        network: 'REMOTE_ONLY',
        relays: SEARCH_RELAYS,
      },
    }),
  )
}

function useSearchLocalUsers(options: SearchOptions) {
  const { query, limit } = options
  return useQuery({
    queryKey: ['search-users', query, limit],
    enabled: !!query,
    queryFn: () => dbSqlite.queryUsers(query, limit),
  })
}

export function useSearchSuggestions(options: SearchOptions) {
  const usersRelay = useSearchOnRelays(options)
  const usersLocal = useSearchLocalUsers(options)
  const querySuggestion =
    options.suggestQuery !== false && options.query ? { type: 'query', query: options.query } : undefined
  const relaySuggestion =
    options.suggestRelays !== false && options.query
      ? {
        type: 'relay',
        relay:
          (options.query.startsWith('wss://') || options.query.startsWith('ws://') ? '' : 'wss://') + options.query,
      }
      : undefined
  return [
    querySuggestion,
    relaySuggestion,
    ...(usersLocal.data?.map((user) => ({ type: 'user' as const, pubkey: user.pubkey })) || []),
    ...(usersRelay.data?.map((x) => ({ type: 'user_relay' as const, pubkey: x.pubkey })) || []),
  ].filter((x) => !!x) as SearchItem[]
}
