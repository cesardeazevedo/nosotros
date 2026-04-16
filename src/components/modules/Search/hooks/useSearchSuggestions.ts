import { Kind } from '@/constants/kinds'
import { SEARCH_RELAYS } from '@/constants/relays'
import { createEventQueryOptions } from '@/hooks/query/useQueryBase'
import { dbSqlite } from '@/nostr/db'
import { isNamecoinIdentifier, resolveNamecoin } from '@/services/namecoin'
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
  | { type: 'user_namecoin'; pubkey: string; address: string }
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

/** Resolve .bit/d//id/ identifiers via Namecoin blockchain */
function useSearchNamecoin(query: string) {
  const isNmc = isNamecoinIdentifier(query)
  return useQuery({
    queryKey: ['search-namecoin', query],
    enabled: isNmc,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const result = await resolveNamecoin(query)
      if (!result) return null
      return { pubkey: result.pubkey, address: query }
    },
  })
}

export function useSearchSuggestions(options: SearchOptions) {
  const usersRelay = useSearchOnRelays(options)
  const usersLocal = useSearchLocalUsers(options)
  const namecoinResult = useSearchNamecoin(options.query)
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

  const namecoinSuggestion = namecoinResult.data
    ? { type: 'user_namecoin' as const, pubkey: namecoinResult.data.pubkey, address: namecoinResult.data.address }
    : undefined

  return [
    namecoinSuggestion,
    querySuggestion,
    relaySuggestion,
    ...(usersLocal.data?.map((user) => ({ type: 'user' as const, pubkey: user.pubkey })) || []),
    ...(usersRelay.data?.map((x) => ({ type: 'user_relay' as const, pubkey: x.pubkey })) || []),
  ].filter((x) => !!x) as SearchItem[]
}
