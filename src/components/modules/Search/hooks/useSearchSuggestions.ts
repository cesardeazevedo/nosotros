import { userEmbeddingsQueryFamily } from '@/atoms/users.atoms'
import { Kind } from '@/constants/kinds'
import { SEARCH_RELAYS } from '@/constants/relays'
import { createEventQueryOptions } from '@/hooks/query/useQueryBase'
import { useSettings } from '@/hooks/useSettings'
import { useCurrentPubkey } from '@/hooks/useAuth'
import { dbSqlite } from '@/nostr/db'
import { selectLatestPublishedEmbedding } from '@/utils/embeddings'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

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
  const settings = useSettings()
  const currentPubkey = useCurrentPubkey()
  const currentUserEmbeddings = useAtomValue(userEmbeddingsQueryFamily(currentPubkey))
  const currentEmbedding = selectLatestPublishedEmbedding(currentUserEmbeddings.data)
  const shouldRankByEmbedding = settings.renderEmbeddingSimilarity && !!currentEmbedding

  return useQuery({
    queryKey: ['search-users', query, limit, shouldRankByEmbedding, currentEmbedding?.modelId, currentEmbedding?.createdAt],
    enabled: !!query,
    queryFn: () =>
      shouldRankByEmbedding && currentEmbedding
        ? dbSqlite.queryUsersByEmbedding(query, currentEmbedding.vector, limit, currentEmbedding.modelId)
        : dbSqlite.queryUsersWithEmbeddings(query, limit),
  })
}

function useEmbeddedRelayPubkeys(options: SearchOptions, pubkeys: string[], modelId?: string) {
  return useQuery({
    queryKey: ['search-users-relay-embedded', options.query, modelId, ...pubkeys],
    enabled: pubkeys.length > 0,
    queryFn: () => dbSqlite.queryEmbeddedPubkeys(pubkeys, modelId),
  })
}

export function useSearchSuggestions(options: SearchOptions) {
  const usersRelay = useSearchOnRelays(options)
  const usersLocal = useSearchLocalUsers(options)
  const currentPubkey = useCurrentPubkey()
  const currentUserEmbeddings = useAtomValue(userEmbeddingsQueryFamily(currentPubkey))
  const currentEmbedding = selectLatestPublishedEmbedding(currentUserEmbeddings.data)
  const localUserPubkeys = new Set((usersLocal.data || []).map((user) => user.pubkey))
  const relayPubkeys = Array.from(new Set((usersRelay.data || []).map((event) => event.pubkey)))
  const embeddedRelayPubkeys = useEmbeddedRelayPubkeys(options, relayPubkeys, currentEmbedding?.modelId)
  const embeddedRelayPubkeySet = new Set(embeddedRelayPubkeys.data || [])
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
    ...(usersRelay.data
      ?.filter((event) => embeddedRelayPubkeySet.has(event.pubkey) && !localUserPubkeys.has(event.pubkey))
      .map((x) => ({ type: 'user_relay' as const, pubkey: x.pubkey })) || []),
  ].filter((x) => !!x) as SearchItem[]
}
