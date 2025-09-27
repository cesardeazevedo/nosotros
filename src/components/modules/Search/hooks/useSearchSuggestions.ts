import { Kind } from '@/constants/kinds'
import { SEARCH_RELAYS } from '@/constants/relays'
import { isAuthorTag } from '@/hooks/parsers/parseTags'
import { createEventQueryOptions, replaceableEventQueryOptions } from '@/hooks/query/useQueryBase'
import { useUserFollows } from '@/hooks/query/useQueryUser'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { useQueries, useQuery } from '@tanstack/react-query'

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

function useSearchFollowingUsers(options: SearchOptions) {
  const { query, limit } = options
  const pubkey = useCurrentPubkey()
  const follows = useUserFollows(pubkey)
  return useQueries({
    queries:
      follows.data?.tags.filter(isAuthorTag).map((tag) => {
        return replaceableEventQueryOptions(Kind.Metadata, tag[1])
      }) || [],
    combine: (results) => {
      return {
        data: results
          .filter((x) => !!x)
          .map((result) => result.data)
          .filter((user) => user?.content.toLowerCase().indexOf(query.toLowerCase()) !== -1)
          .slice(0, limit),
      }
    },
  })
}

export function useSearchSuggestions(options: SearchOptions) {
  const usersRelay = useSearchOnRelays(options)
  const usersFollowing = useSearchFollowingUsers(options)
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
    ...usersFollowing.data.filter((x) => !!x).map((user) => ({ type: 'user' as const, pubkey: user.pubkey })),
    ...(usersRelay.data?.map((x) => ({ type: 'user_relay' as const, pubkey: x.pubkey })) || []),
  ].filter((x) => !!x) as SearchItem[]
}
