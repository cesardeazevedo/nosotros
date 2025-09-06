import { Kind } from '@/constants/kinds'
import { formatRelayUrl } from '@/core/helpers/formatRelayUrl'
import type { NostrEventDB } from '@/db/sqlite/sqlite.types'
import { selectRelays } from '@/hooks/parsers/selectRelays'
import { dbSqlite } from '@/nostr/db'
import type { UserRelay } from '@/nostr/types'
import { READ, WRITE } from '@/nostr/types'
import { useQueries, useQuery } from '@tanstack/react-query'
import { batcherRelayList } from '../batchers'
import { queryClient } from './queryClient'
import { queryKeys } from './queryKeys'
import type { CustomQueryOptions } from './useQueryBase'
import { replaceableEventQueryOptions, useReplaceableEvent } from './useQueryBase'
import { DEFAULT_NIP96_SERVERS } from '@/constants/relays'

export function useEventMetadata(pubkey: string | undefined, options?: CustomQueryOptions<NostrEventDB>) {
  return useReplaceableEvent(Kind.Metadata, pubkey || '', {
    ...options,
    enabled: !!pubkey,
  })
}

export function useUserFollows(pubkey = '', options?: CustomQueryOptions<NostrEventDB>) {
  return useQuery(replaceableEventQueryOptions(Kind.Follows, pubkey, options))
}

export function useUserBlossomServers<Selector = NostrEventDB>(
  pubkey: string | undefined,
  options?: CustomQueryOptions<Selector>,
) {
  return useReplaceableEvent(Kind.BlossomServerList, pubkey || '', {
    ...options,
    enabled: !!pubkey,
    select: (events) => {
      return events.flatMap((event) => event.tags.filter((x) => x[0] === 'server').flatMap((tag) => tag[1]))
    },
  })
}

export function useUserNIP96Servers<Selector = NostrEventDB>(
  pubkey: string | undefined,
  options?: CustomQueryOptions<Selector>,
) {
  return useReplaceableEvent(Kind.NIP96ServerList, pubkey || '', {
    ...options,
    enabled: !!pubkey,
    select: (events) => {
      return events.flatMap((event) => event.tags.filter((x) => x[0] === 'server').flatMap((tag) => tag[1]))
    },
  })
}

export function useUserMuteList(pubkey: string, options?: CustomQueryOptions<NostrEventDB>) {
  return useReplaceableEvent(Kind.Mutelist, pubkey, options)
}

function userRelaysQueryOptions(pubkey: string | undefined, permission: number) {
  return replaceableEventQueryOptions(Kind.RelayList, pubkey || '', {
    enabled: !!pubkey,
    ctx: {
      batcher: batcherRelayList,
      network: 'STALE_WHILE_REVALIDATE_BATCH',
    },
    select: (events) => {
      return (
        events.flatMap((event) => {
          return (
            event.metadata?.relayList?.filter((data) => {
              return permission !== undefined ? !!(data.permission & permission) || !data.permission : true
            }) || []
          )
        }) || []
      )
    },
  })
}

export function getUserRelaysFromCache(pubkey: string, permission = READ | WRITE) {
  const options = userRelaysQueryOptions(pubkey, permission)
  const raw = queryClient.getQueryData<NostrEventDB[]>(options.queryKey)
  return raw && options.select ? options.select(raw) : []
}

export function useUserRelays(pubkey: string | undefined, permission: number) {
  return useQuery(userRelaysQueryOptions(pubkey, permission))
}

export function useRelayUsers(relay: string, permission = READ | WRITE) {
  return useQuery({
    queryKey: queryKeys.relayUsers(relay),
    queryFn: () => {
      return dbSqlite.queryEvents({ kinds: [Kind.RelayList], '#r': [formatRelayUrl(relay)] })
    },
    select: (data) => {
      return data
        .filter((event) => event.metadata?.relayList?.find((userRelay) => userRelay.permission & permission))
        .map((event) => event.pubkey)
    },
  })
}

export function useUsersRelays(pubkeys: string[], permission: number) {
  return useQueries({
    queries: pubkeys.map((pubkey) => {
      return userRelaysQueryOptions(pubkey, permission)
    }),
    combine: (results) => {
      const map: Record<string, UserRelay[]> = {}

      for (const res of results) {
        const list = res.data ?? []
        for (const item of list) {
          if (!map[item.pubkey]) {
            map[item.pubkey] = []
          }
          map[item.pubkey].push(item)
        }
      }

      return { data: map }
    },
  })
}

export function getUserRelays(pubkey: string, permission: number) {
  const userRelays = queryClient.getQueryData<NostrEventDB[]>(queryKeys.replaceable(Kind.RelayList, pubkey))
  return userRelays
    ? selectRelays(userRelays[0].metadata?.relayList || [], { permission, maxRelaysPerUser: 4 }).map((x) => x.relay)
    : []
}
